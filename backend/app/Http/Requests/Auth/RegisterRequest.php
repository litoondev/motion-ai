<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class RegisterRequest extends FormRequest
{
    private const DISPOSABLE_DOMAINS = [
        'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
        'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
        'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
        'guerrillamail.net', 'guerrillamail.org', 'spam4.me', 'trashmail.com',
        'trashmail.me', 'trashmail.net', 'fakeinbox.com', 'mailnull.com',
        'maildrop.cc', 'dispostable.com', 'discard.email', 'throwaway.email',
        'temp-mail.org', 'tmpmail.net', 'getnada.com', 'getairmail.com',
        'mohmal.com', 'mailnesia.com', 'tempr.email', 'spamgourmet.com',
        'trashmail.io',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $email = $this->input('email');
            if ($email) {
                $domain = strtolower(substr(strrchr($email, '@'), 1));
                if (in_array($domain, self::DISPOSABLE_DOMAINS, true)) {
                    $validator->errors()->add('email', 'Disposable email addresses are not allowed.');
                }
            }
        });
    }
}
