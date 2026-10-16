<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GenerateLicenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'type' => ['required', 'string', 'in:trial,paid'],
            'seat_count' => ['required', 'integer', 'min:1'],
            'year_count' => ['nullable', 'integer', 'min:1', 'max:10'],
        ];
    }
}
