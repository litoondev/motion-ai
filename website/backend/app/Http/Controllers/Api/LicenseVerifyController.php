<?php

namespace App\Http\Controllers\Api;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LicenseVerifyRequest;
use App\Models\Device;
use App\Models\License;
use Illuminate\Http\JsonResponse;

class LicenseVerifyController extends Controller
{
    /**
     * Plugin-facing license verification.
     * Returns flat JSON (no envelope) for backward compatibility with shipped plugins.
     */
    public function verify(LicenseVerifyRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $deviceHash = substr(hash('sha256', $validated['deviceRaw']), 0, 32);

        $license = License::with('user')->where('license_key', $validated['licenseKey'])->first();

        if (!$license) {
            return response()->json(['valid' => false, 'error' => 'Invalid license key']);
        }

        if ($license->status !== LicenseStatus::Active) {
            return response()->json(['valid' => false, 'error' => "License is {$license->status->value}"]);
        }

        // Trial licenses hard-expire
        if ($license->type === LicenseType::Trial && $license->expires_at && $license->expires_at->isPast()) {
            $license->update(['status' => LicenseStatus::Expired]);
            return response()->json(['valid' => false, 'error' => 'Trial expired']);
        }

        // Check existing device on this license
        $existingDevice = Device::where('license_id', $license->id)
            ->where('device_id', $deviceHash)
            ->first();

        if ($existingDevice) {
            if ($existingDevice->is_active) {
                $updateData = ['last_seen_at' => now()];
                if (!empty($validated['deviceName'])) {
                    $updateData['device_name'] = $validated['deviceName'];
                }
                if (!empty($validated['platform'])) {
                    $updateData['platform'] = $validated['platform'];
                }
                if (!empty($validated['aeVersion'])) {
                    $updateData['ae_version'] = $validated['aeVersion'];
                }
                $existingDevice->update($updateData);

                return response()->json([
                    'valid' => true,
                    'deviceLinked' => true,
                    'newDevice' => false,
                ]);
            }

            return response()->json([
                'valid' => false,
                'error' => 'Device has been unlinked',
                'unlinkUrl' => config('app.frontend_url') . '/dashboard',
            ]);
        }

        // New device — check capacity
        $maxDevices = $license->maxDevices();
        if ($license->activeDeviceCount() >= $maxDevices) {
            return response()->json([
                'valid' => false,
                'error' => "Device limit reached ({$maxDevices}). Unlink a device from your dashboard first.",
                'unlinkUrl' => config('app.frontend_url') . '/dashboard',
            ]);
        }

        // Link new device
        Device::create([
            'user_id' => $license->user_id,
            'license_id' => $license->id,
            'device_id' => $deviceHash,
            'device_name' => $validated['deviceName'] ?? null,
            'platform' => $validated['platform'] ?? null,
            'ae_version' => $validated['aeVersion'] ?? null,
            'linked_at' => now(),
            'last_seen_at' => now(),
            'is_active' => true,
        ]);

        return response()->json([
            'valid' => true,
            'deviceLinked' => true,
            'newDevice' => true,
        ]);
    }
}
