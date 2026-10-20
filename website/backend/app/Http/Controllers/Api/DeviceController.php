<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeviceResource;
use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $devices = Device::whereHas('license', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->latest()->paginate(15);

        return $this->success(DeviceResource::collection($devices)->response()->getData(true));
    }

    public function unlink(Request $request, Device $device): JsonResponse
    {
        // Verify ownership
        if ($device->user_id !== $request->user()->id) {
            return $this->error('Device not found.', 404);
        }

        $device->update(['is_active' => false]);

        return $this->success(null, 'Device unlinked successfully.');
    }
}
