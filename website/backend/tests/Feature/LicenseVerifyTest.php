<?php

namespace Tests\Feature;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Models\Device;
use App\Models\License;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LicenseVerifyTest extends TestCase
{
    use RefreshDatabase;

    private function verifyPayload(string $key, string $deviceRaw = 'test-device-raw'): array
    {
        return [
            'licenseKey' => $key,
            'deviceRaw' => $deviceRaw,
            'deviceName' => 'Test Machine',
            'platform' => 'Windows',
            'aeVersion' => '2025',
        ];
    }

    public function test_rejects_invalid_license_key(): void
    {
        $response = $this->postJson('/api/v1/license/verify', $this->verifyPayload('INVALID-KEY'));

        $response->assertOk()
            ->assertJson(['valid' => false, 'error' => 'Invalid license key']);
    }

    public function test_accepts_valid_license_and_links_new_device(): void
    {
        $user = User::factory()->create();
        $license = License::factory()->for($user)->create([
            'status' => LicenseStatus::Active,
            'seat_count' => 1,
        ]);

        $response = $this->postJson('/api/v1/license/verify', $this->verifyPayload($license->license_key));

        $response->assertOk()
            ->assertJson(['valid' => true, 'deviceLinked' => true, 'newDevice' => true]);

        $this->assertDatabaseHas('devices', [
            'license_id' => $license->id,
            'user_id' => $user->id,
            'is_active' => true,
        ]);
    }

    public function test_recognizes_known_device_and_updates_last_seen(): void
    {
        $user = User::factory()->create();
        $license = License::factory()->for($user)->create();
        $deviceRaw = 'known-device-fingerprint';
        $deviceHash = substr(hash('sha256', $deviceRaw), 0, 32);

        Device::factory()->for($user)->create([
            'license_id' => $license->id,
            'device_id' => $deviceHash,
            'is_active' => true,
            'last_seen_at' => now()->subDay(),
        ]);

        $response = $this->postJson('/api/v1/license/verify', $this->verifyPayload($license->license_key, $deviceRaw));

        $response->assertOk()
            ->assertJson(['valid' => true, 'deviceLinked' => true, 'newDevice' => false]);
    }

    public function test_rejects_when_device_limit_reached(): void
    {
        $user = User::factory()->create();
        $license = License::factory()->for($user)->create(['seat_count' => 1]);

        // Create 2 active devices (max = seat_count * 2 = 2)
        Device::factory()->count(2)->for($user)->create([
            'license_id' => $license->id,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/license/verify', $this->verifyPayload($license->license_key, 'new-device'));

        $response->assertOk()
            ->assertJson(['valid' => false])
            ->assertJsonFragment(['unlinkUrl' => config('app.frontend_url') . '/dashboard']);
    }

    public function test_rejects_expired_trial(): void
    {
        $user = User::factory()->create();
        $license = License::factory()->for($user)->create([
            'type' => LicenseType::Trial,
            'status' => LicenseStatus::Active,
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->postJson('/api/v1/license/verify', $this->verifyPayload($license->license_key));

        $response->assertOk()
            ->assertJson(['valid' => false, 'error' => 'Trial expired']);

        $this->assertDatabaseHas('licenses', [
            'id' => $license->id,
            'status' => LicenseStatus::Expired->value,
        ]);
    }

    public function test_rejects_suspended_license(): void
    {
        $user = User::factory()->create();
        $license = License::factory()->for($user)->create(['status' => LicenseStatus::Suspended]);

        $response = $this->postJson('/api/v1/license/verify', $this->verifyPayload($license->license_key));

        $response->assertOk()
            ->assertJson(['valid' => false, 'error' => 'License is suspended']);
    }

    public function test_unlinked_device_returns_error(): void
    {
        $user = User::factory()->create();
        $license = License::factory()->for($user)->create();
        $deviceRaw = 'unlinked-device';
        $deviceHash = substr(hash('sha256', $deviceRaw), 0, 32);

        Device::factory()->for($user)->create([
            'license_id' => $license->id,
            'device_id' => $deviceHash,
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/license/verify', $this->verifyPayload($license->license_key, $deviceRaw));

        $response->assertOk()
            ->assertJson(['valid' => false, 'error' => 'Device has been unlinked']);
    }

    public function test_legacy_path_also_works(): void
    {
        $response = $this->postJson('/api/license/verify', $this->verifyPayload('INVALID'));

        $response->assertOk()
            ->assertJson(['valid' => false]);
    }
}
