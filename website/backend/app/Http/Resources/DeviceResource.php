<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_id' => $this->device_id,
            'device_name' => $this->device_name,
            'platform' => $this->platform,
            'ae_version' => $this->ae_version,
            'linked_at' => $this->linked_at,
            'last_seen_at' => $this->last_seen_at,
            'is_active' => $this->is_active,
            'license' => new LicenseResource($this->whenLoaded('license')),
        ];
    }
}
