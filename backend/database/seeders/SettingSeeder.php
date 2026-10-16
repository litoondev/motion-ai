<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Seed the settings table.
     */
    public function run(): void
    {
        $settings = [
            'price_per_seat_year' => 49,
            'team_price_per_seat_year' => 39,
            'team_threshold' => 5,
            'trial_days' => 7,
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value);
        }
    }
}
