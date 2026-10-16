<?php

namespace App\Services;

use App\Models\Setting;

class PricingService
{
    public function calculate(int $seats, int $years): array
    {
        $basePrice = (float) Setting::get('price_per_seat_year', 49);
        $teamPrice = (float) Setting::get('team_price_per_seat_year', 39);
        $teamThreshold = (int) Setting::get('team_threshold', 5);

        $pricePerSeat = $seats >= $teamThreshold ? $teamPrice : $basePrice;
        $total = $seats * $years * $pricePerSeat;

        return [
            'price_per_seat' => $pricePerSeat,
            'seats' => $seats,
            'years' => $years,
            'total' => $total,
            'is_team' => $seats >= $teamThreshold,
        ];
    }

    public function getPricing(): array
    {
        return [
            'price_per_seat_year' => (float) Setting::get('price_per_seat_year', 49),
            'team_price_per_seat_year' => (float) Setting::get('team_price_per_seat_year', 39),
            'team_threshold' => (int) Setting::get('team_threshold', 5),
            'trial_days' => (int) Setting::get('trial_days', 7),
        ];
    }
}
