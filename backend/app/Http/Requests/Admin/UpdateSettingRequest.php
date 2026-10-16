<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    private const ALLOWED_KEYS = [
        'price_per_seat_year',
        'team_price_per_seat_year',
        'team_threshold',
        'trial_days',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.*' => ['required', 'string'],
        ];
    }

    public function withValidator(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Contracts\Validation\Validator $validator) {
            $settings = $this->input('settings', []);
            foreach (array_keys($settings) as $key) {
                if (!in_array($key, self::ALLOWED_KEYS, true)) {
                    $validator->errors()->add(
                        "settings.{$key}",
                        "The setting key '{$key}' is not allowed."
                    );
                }
            }
        });
    }
}
