<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\GoogleAuthRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Google\Client as Google_Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
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

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['email'] === env('ADMIN_EMAIL') ? Role::Admin : Role::User,
            'status' => UserStatus::Active,
        ]);

        $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Registration successful.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $throttleKey = Str::lower($validated['email']) . '|login';

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return $this->error("Too many login attempts. Please try again in {$seconds} seconds.", 429);
        }

        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            RateLimiter::hit($throttleKey, 60);
            return $this->error('Invalid credentials.', 401);
        }

        RateLimiter::clear($throttleKey);

        $user = Auth::user();

        if ($user->isBlocked()) {
            Auth::logout();
            return $this->error('Your account has been blocked.', 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Login successful.');
    }

    public function google(GoogleAuthRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $client = new Google_Client(['client_id' => config('services.google.client_id')]);
        $payload = $client->verifyIdToken($validated['id_token']);

        if (!$payload) {
            return $this->error('Invalid Google token.', 401);
        }

        $email = $payload['email'];
        $name = $payload['name'] ?? '';
        $avatar = $payload['picture'] ?? null;

        // Check disposable email
        $domain = strtolower(substr(strrchr($email, '@'), 1));
        if (in_array($domain, self::DISPOSABLE_DOMAINS, true)) {
            return $this->error('Disposable email addresses are not allowed.', 422);
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            if ($user->isBlocked()) {
                return $this->error('Your account has been blocked.', 403);
            }

            if (!$user->google_id) {
                $user->update(['google_id' => $payload['sub']]);
            }

            if ($avatar && !$user->avatar) {
                $user->update(['avatar' => $avatar]);
            }
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'google_id' => $payload['sub'],
                'avatar' => $avatar,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(32)),
                'role' => $email === env('ADMIN_EMAIL') ? Role::Admin : Role::User,
                'status' => UserStatus::Active,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Google authentication successful.');
    }

    public function logout(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $user->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully.');
    }

    public function me(): JsonResponse
    {
        return $this->success(new UserResource(Auth::user()));
    }
}
