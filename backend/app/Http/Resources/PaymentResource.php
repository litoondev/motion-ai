<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method,
            'status' => $this->status,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'bank_tx_ref' => $this->bank_tx_ref,
            'has_slip' => $this->bank_slip_path !== null,
            'admin_note' => $this->admin_note,
            'reviewed_at' => $this->reviewed_at,
            'reviewed_by' => $this->reviewed_by,
            'stripe_session_id' => $this->stripe_session_id,
            'seat_count' => $this->seat_count,
            'year_count' => $this->year_count,
            'created_at' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'license' => new LicenseResource($this->whenLoaded('license')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
        ];
    }
}
