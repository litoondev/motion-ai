<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LicenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'license_key' => $this->license_key,
            'type' => $this->type,
            'status' => $this->status,
            'purchased_at' => $this->purchased_at,
            'expires_at' => $this->expires_at,
            'updated_until' => $this->updated_until,
            'seat_count' => $this->seat_count,
            'active_devices' => $this->activeDeviceCount(),
            'max_devices' => $this->maxDevices(),
            'created_at' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'devices' => DeviceResource::collection($this->whenLoaded('devices')),
        ];
    }
}
