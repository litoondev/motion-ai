<?php

namespace App\Http\Controllers\Api;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Http\Controllers\Controller;
use App\Http\Resources\LicenseResource;
use App\Models\License;
use App\Models\Setting;
use App\Services\LicenseKeyGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrialController extends Controller
{
    public function activate(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->trial_used) {
            return $this->error('You have already used your free trial.', 409);
        }

        $trialDays = (int) Setting::get('trial_days', 7);

        $license = DB::transaction(function () use ($user, $trialDays) {
            $user->update([
                'trial_used' => true,
                'trial_started_at' => now(),
                'trial_ends_at' => now()->addDays($trialDays),
            ]);

            return License::create([
                'user_id' => $user->id,
                'type' => LicenseType::Trial,
                'status' => LicenseStatus::Active,
                'license_key' => LicenseKeyGenerator::generate(),
                'seat_count' => 1,
                'purchased_at' => now(),
                'expires_at' => now()->addDays($trialDays),
            ]);
        });

        return $this->success(new LicenseResource($license), 'Trial activated successfully.', 201);
    }
}
