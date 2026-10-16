<?php

namespace Database\Seeders;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Device;
use App\Models\License;
use App\Models\Payment;
use App\Models\User;
use App\Services\LicenseKeyGenerator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Seed test data for development.
     */
    public function run(): void
    {
        // 1. Normal user with paid license, 2 devices, 1 approved payment
        $paidUser = User::factory()->create([
            'email' => 'user@example.com',
            'name' => 'Test User',
            'password' => Hash::make('password'),
        ]);

        $paidLicense = License::factory()->create([
            'user_id' => $paidUser->id,
            'type' => LicenseType::Paid,
            'status' => LicenseStatus::Active,
            'seat_count' => 2,
            'purchased_at' => now(),
            'expires_at' => now()->addYear(),
            'updated_until' => now()->addYear(),
        ]);

        Device::factory()->count(2)->create([
            'user_id' => $paidUser->id,
            'license_id' => $paidLicense->id,
        ]);

        Payment::factory()->approved()->create([
            'user_id' => $paidUser->id,
            'license_id' => $paidLicense->id,
            'amount' => 98.00,
            'seat_count' => 2,
            'year_count' => 1,
        ]);

        // 2. User with a trial license
        $trialUser = User::factory()->withTrial()->create();

        License::factory()->trial()->create([
            'user_id' => $trialUser->id,
        ]);

        // 3. Two users with no license
        User::factory()->count(2)->create();

        // 4. Three pending bank transfer payments for different users
        $pendingUsers = User::factory()->count(3)->create();

        foreach ($pendingUsers as $pendingUser) {
            Payment::factory()->create([
                'user_id' => $pendingUser->id,
                'method' => PaymentMethod::BankTransfer,
                'status' => PaymentStatus::Pending,
                'bank_tx_ref' => 'TX-' . strtoupper(fake()->bothify('??######')),
            ]);
        }
    }
}
