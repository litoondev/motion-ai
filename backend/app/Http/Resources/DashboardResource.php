<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this->resource['user']),
            'licenses' => LicenseResource::collection($this->resource['licenses']),
            'recent_payments' => PaymentResource::collection($this->resource['recent_payments']),
        ];
    }
}
