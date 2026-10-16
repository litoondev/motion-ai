<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class LicenseVerifyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'licenseKey' => ['required', 'string'],
            'deviceRaw' => ['required', 'string'],
            'deviceName' => ['sometimes', 'string', 'max:255'],
            'platform' => ['sometimes', 'string', 'max:100'],
            'aeVersion' => ['sometimes', 'string', 'max:50'],
        ];
    }
}
