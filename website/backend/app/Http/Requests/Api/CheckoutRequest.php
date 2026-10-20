<?php

namespace App\Http\Requests\Api;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'method' => ['required', Rule::enum(PaymentMethod::class)],
            'tx_ref' => ['required_unless:method,card', 'string', 'max:255'],
            'slip' => ['sometimes', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
