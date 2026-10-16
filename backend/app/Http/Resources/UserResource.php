<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'status' => $this->status,
            'email_verified_at' => $this->email_verified_at,
            'trial_used' => $this->trial_used,
            'trial_started_at' => $this->trial_started_at,
            'trial_ends_at' => $this->trial_ends_at,
            'created_at' => $this->created_at,
            'licenses_count' => $this->when($this->licenses_count !== null, $this->licenses_count),
            'active_license' => new LicenseResource($this->whenLoaded('activeLicense')),
        ];
    }
}
