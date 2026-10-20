<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LicenseStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\License;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success([
            'total_users' => User::count(),
            'active_licenses' => License::where('status', LicenseStatus::Active)->count(),
            'pending_payments' => Payment::where('status', PaymentStatus::Pending)->count(),
            'active_devices' => Device::where('is_active', true)->count(),
            'recent_signups' => User::where('created_at', '>=', now()->subDays(30))->count(),
        ]);
    }
}
