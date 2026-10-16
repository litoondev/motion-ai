<?php

namespace Database\Factories;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Models\User;
use App\Services\LicenseKeyGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\License>
 */
class LicenseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'license_key' => LicenseKeyGenerator::generate(),
            'type' => LicenseType::Paid,
            'status' => LicenseStatus::Active,
            'purchased_at' => now(),
            'expires_at' => now()->addYear(),
            'updated_until' => now()->addYear(),
            'seat_count' => 1,
        ];
    }

    /**
     * Indicate that the license is a trial.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => LicenseType::Trial,
            'seat_count' => 1,
            'expires_at' => now()->addDays(7),
        ]);
    }

    /**
     * Indicate that the license is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LicenseStatus::Expired,
            'expires_at' => now()->subDay(),
        ]);
    }

    /**
     * Indicate that the license is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LicenseStatus::Suspended,
        ]);
    }

    /**
     * Indicate that the license is a lifetime license.
     */
    public function lifetime(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => null,
        ]);
    }
}
