<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Http\Resources\LicenseResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $licenses = $user->licenses()->with('devices')->get();
        $recentPayments = $user->payments()->latest()->limit(10)->get();

        return $this->success([
            'user' => new UserResource($user),
            'licenses' => LicenseResource::collection($licenses),
            'recent_payments' => PaymentResource::collection($recentPayments),
        ]);
    }
}
