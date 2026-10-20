<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
            AdminSeeder::class,
        ]);

        // Fake users / licenses / payments must never reach production.
        if (app()->environment(['local', 'testing'])) {
            $this->call(TestDataSeeder::class);
        }
    }
}
