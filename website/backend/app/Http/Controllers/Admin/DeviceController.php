<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeviceResource;
use App\Models\Device;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Device::with('license.user');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('device_name', 'like', "%{$search}%")
                  ->orWhere('device_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $devices = $query->latest()->paginate(min((int) $request->input('per_page', 15), 100));

        return $this->success(DeviceResource::collection($devices)->response()->getData(true));
    }

    public function forceUnlink(Request $request, Device $device): JsonResponse
    {
        $device->update(['is_active' => false]);

        AuditService::log(
            admin: $request->user(),
            action: 'device.force_unlinked',
            target: $device,
            ip: $request->ip(),
        );

        return $this->success(null, 'Device unlinked successfully.');
    }
}
