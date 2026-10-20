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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

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
            'role' => $this->isAdminEmail($validated['email']) ? Role::Admin : Role::User,
            'status' => UserStatus::Active,
        ]);

        $this->sendVerificationEmail($user);

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

        // NOTE: do not use Auth::attempt() here. This is a stateless token API,
        // there is no session store, so SessionGuard::attempt() would throw a 500.
        $user = User::where('email', $validated['email'])->first();

        if (!$user || !$user->password || !Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            return $this->error('Invalid credentials.', 401);
        }

        RateLimiter::clear($throttleKey);

        if ($user->isBlocked()) {
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
                'role' => $this->isAdminEmail($email) ? Role::Admin : Role::User,
                'status' => UserStatus::Active,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Google authentication successful.');
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $token = $user->currentAccessToken();

        // Cookie (SPA) auth gives a TransientToken which cannot be deleted.
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return $this->success(null, 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()));
    }

    private function isAdminEmail(string $email): bool
    {
        $adminEmail = config('app.admin_email');

        return $adminEmail && strcasecmp($email, $adminEmail) === 0;
    }

    /**
     * A broken/empty SMTP config must not turn a successful registration into a 500.
     */
    private function sendVerificationEmail(User $user): void
    {
        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            Log::warning('Could not send verification email: ' . $e->getMessage());
        }
    }
}
