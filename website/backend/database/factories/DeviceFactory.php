<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Device>
 */
class DeviceFactory extends Factory
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
            'device_id' => substr(hash('sha256', fake()->uuid()), 0, 32),
            'device_name' => fake()->words(2, true),
            'platform' => fake()->randomElement(['Windows', 'macOS']),
            'ae_version' => fake()->randomElement(['2024', '2025']),
            'linked_at' => now(),
            'last_seen_at' => now(),
            'is_active' => true,
        ];
    }
}
