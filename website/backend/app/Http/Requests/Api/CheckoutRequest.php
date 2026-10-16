<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'seats' => ['required', 'integer', 'min:1', 'max:100'],
            'years' => ['required', 'integer', 'min:1', 'max:5'],
            'method' => ['required', 'string', 'in:card,bank_transfer'],
            'tx_ref' => ['required_if:method,bank_transfer', 'string', 'max:255'],
            'slip' => ['sometimes', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
