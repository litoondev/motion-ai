<?php

namespace App\Console\Commands;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\Device;
use App\Models\License;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportFromSqlite extends Command
{
    protected $signature = 'import:sqlite {path : Path to the SQLite dev.db file}';

    protected $description = 'Import users, licenses, devices, and payments from the old SQLite database into MySQL';

    public function handle(): int
    {
        $path = $this->argument('path');

        if (!file_exists($path)) {
            $this->error("SQLite file not found: {$path}");
            return self::FAILURE;
        }

        config(['database.connections.sqlite_import' => [
            'driver' => 'sqlite',
            'database' => $path,
            'prefix' => '',
        ]]);

        $this->info('Connected to SQLite database.');

        DB::beginTransaction();

        try {
            $this->importUsers();
            $this->importLicenses();
            $this->importDevices();
            $this->importPayments();

            DB::commit();
            $this->info('Import completed successfully.');
            return self::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("Import failed: {$e->getMessage()}");
            $this->error($e->getTraceAsString());
            return self::FAILURE;
        }
    }

    private function importUsers(): void
    {
        $oldUsers = DB::connection('sqlite_import')->table('User')->get();
        $this->info("Importing {$oldUsers->count()} users...");

        $bar = $this->output->createProgressBar($oldUsers->count());

        foreach ($oldUsers as $old) {
            $role = strtolower($old->role ?? 'USER') === 'admin' ? Role::Admin : Role::User;

            User::updateOrCreate(
                ['email' => $old->email],
                [
                    'name' => $old->name ?? explode('@', $old->email)[0],
                    'password' => null,
                    'avatar' => $old->image,
                    'role' => $role,
                    'status' => UserStatus::Active,
                    'email_verified_at' => $old->emailVerified,
                    'trial_used' => (bool) ($old->trialUsed ?? false),
                    'trial_started_at' => $old->trialStartedAt,
                    'trial_ends_at' => $old->trialEndsAt,
                    'created_at' => $old->createdAt ?? now(),
                    'updated_at' => $old->updatedAt ?? now(),
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    private function importLicenses(): void
    {
        $oldLicenses = DB::connection('sqlite_import')->table('License')->get();
        $this->info("Importing {$oldLicenses->count()} licenses...");

        $bar = $this->output->createProgressBar($oldLicenses->count());

        foreach ($oldLicenses as $old) {
            $user = $this->findUserByOldId($old->userId);
            if (!$user) {
                $this->warn("Skipping license {$old->licenseKey}: user {$old->userId} not found.");
                $bar->advance();
                continue;
            }

            $type = strtolower($old->type ?? 'PAID') === 'trial' ? LicenseType::Trial : LicenseType::Paid;
            $status = match (strtolower($old->status ?? 'ACTIVE')) {
                'expired' => LicenseStatus::Expired,
                'suspended' => LicenseStatus::Suspended,
                'revoked' => LicenseStatus::Revoked,
                default => LicenseStatus::Active,
            };

            License::updateOrCreate(
                ['license_key' => $old->licenseKey],
                [
                    'user_id' => $user->id,
                    'type' => $type,
                    'status' => $status,
                    'purchased_at' => $old->purchasedAt,
                    'expires_at' => $old->expiresAt,
                    'updated_until' => $old->updatedUntil,
                    'seat_count' => $old->seatCount ?? 1,
                    'created_at' => $old->createdAt ?? now(),
                    'updated_at' => $old->updatedAt ?? now(),
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    private function importDevices(): void
    {
        $oldDevices = DB::connection('sqlite_import')->table('Device')->get();
        $this->info("Importing {$oldDevices->count()} devices...");

        $bar = $this->output->createProgressBar($oldDevices->count());

        foreach ($oldDevices as $old) {
            $user = $this->findUserByOldId($old->userId);
            if (!$user) {
                $this->warn("Skipping device {$old->deviceId}: user not found.");
                $bar->advance();
                continue;
            }

            $license = null;
            if ($old->licenseId) {
                $oldLicense = DB::connection('sqlite_import')->table('License')->where('id', $old->licenseId)->first();
                if ($oldLicense) {
                    $license = License::where('license_key', $oldLicense->licenseKey)->first();
                }
            }

            Device::updateOrCreate(
                ['device_id' => $old->deviceId],
                [
                    'user_id' => $user->id,
                    'license_id' => $license?->id,
                    'device_name' => $old->deviceName,
                    'platform' => $old->platform,
                    'ae_version' => $old->aeVersion,
                    'linked_at' => $old->linkedAt ?? now(),
                    'last_seen_at' => $old->lastSeenAt ?? now(),
                    'is_active' => (bool) ($old->isActive ?? true),
                    'created_at' => $old->linkedAt ?? now(),
                    'updated_at' => $old->lastSeenAt ?? now(),
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    private function importPayments(): void
    {
        $oldPayments = DB::connection('sqlite_import')->table('Payment')->get();
        $this->info("Importing {$oldPayments->count()} payments...");

        $bar = $this->output->createProgressBar($oldPayments->count());

        foreach ($oldPayments as $old) {
            $user = $this->findUserByOldId($old->userId);
            if (!$user) {
                $this->warn("Skipping payment: user not found.");
                $bar->advance();
                continue;
            }

            $license = null;
            if ($old->licenseId) {
                $oldLicense = DB::connection('sqlite_import')->table('License')->where('id', $old->licenseId)->first();
                if ($oldLicense) {
                    $license = License::where('license_key', $oldLicense->licenseKey)->first();
                }
            }

            $method = strtolower($old->method ?? 'BANK_TRANSFER') === 'card'
                ? PaymentMethod::Card
                : PaymentMethod::BankTransfer;

            $status = match (strtolower($old->status ?? 'PENDING')) {
                'approved' => PaymentStatus::Approved,
                'rejected' => PaymentStatus::Rejected,
                'refunded' => PaymentStatus::Refunded,
                default => PaymentStatus::Pending,
            };

            $reviewedByUser = null;
            if ($old->reviewedBy) {
                $reviewedByOld = DB::connection('sqlite_import')->table('User')->where('id', $old->reviewedBy)->first();
                if ($reviewedByOld) {
                    $reviewedByUser = User::where('email', $reviewedByOld->email)->first();
                }
            }

            Payment::create([
                'user_id' => $user->id,
                'license_id' => $license?->id,
                'method' => $method,
                'status' => $status,
                'amount' => $old->amount ?? 0,
                'currency' => $old->currency ?? 'USD',
                'bank_tx_ref' => $old->bankTxRef,
                'bank_slip_path' => null,
                'admin_note' => $old->adminNote,
                'reviewed_at' => $old->reviewedAt,
                'reviewed_by' => $reviewedByUser?->id,
                'stripe_session_id' => $old->stripeSessionId,
                'stripe_tx_id' => $old->stripeTxId,
                'seat_count' => $old->seatCount ?? 1,
                'year_count' => $old->yearCount ?? 1,
                'created_at' => $old->createdAt ?? now(),
                'updated_at' => $old->updatedAt ?? now(),
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    private function findUserByOldId(string $oldId): ?User
    {
        $oldUser = DB::connection('sqlite_import')->table('User')->where('id', $oldId)->first();
        if (!$oldUser) {
            return null;
        }
        return User::where('email', $oldUser->email)->first();
    }
}
