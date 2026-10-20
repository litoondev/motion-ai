<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangeSeatsRequest;
use App\Http\Requests\Admin\ExtendLicenseRequest;
use App\Http\Requests\Admin\GenerateLicenseRequest;
use App\Http\Resources\LicenseResource;
use App\Models\License;
use App\Models\User;
use App\Services\AuditService;
use App\Services\LicenseKeyGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LicenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = License::with('user');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('license_key', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sortBy = in_array($request->input('sort_by'), ['created_at', 'expires_at', 'status', 'type', 'seat_count'], true)
            ? $request->input('sort_by') : 'created_at';
        $sortDir = $request->input('sort_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $licenses = $query->paginate(min((int) $request->input('per_page', 15), 100));

        return $this->success(LicenseResource::collection($licenses)->response()->getData(true));
    }

    public function show(License $license): JsonResponse
    {
        $license->load(['user', 'devices', 'payment']);

        return $this->success(new LicenseResource($license));
    }

    public function generate(GenerateLicenseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            $user = User::create([
                'name' => explode('@', $validated['email'])[0],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(32)),
                'role' => strcasecmp($validated['email'], (string) config('app.admin_email')) === 0 ? Role::Admin : Role::User,
                'status' => \App\Enums\UserStatus::Active,
            ]);
        }

        $expiresAt = $validated['year_count']
            ? now()->addYears($validated['year_count'])
            : null;

        $license = License::create([
            'user_id' => $user->id,
            'type' => LicenseType::from($validated['type']),
            'status' => LicenseStatus::Active,
            'license_key' => LicenseKeyGenerator::generate(),
            'seat_count' => $validated['seat_count'],
            'purchased_at' => now(),
            'expires_at' => $expiresAt,
            'updated_until' => $expiresAt ? now()->addYear() : null,
        ]);

        AuditService::log(
            admin: $request->user(),
            action: 'license.generated',
            target: $license,
            meta: [
                'for_user' => $user->email,
                'type' => $validated['type'],
                'seat_count' => $validated['seat_count'],
                'year_count' => $validated['year_count'],
            ],
            ip: $request->ip(),
        );

        return $this->success(new LicenseResource($license->load('user')), 'License generated successfully.', 201);
    }

    public function suspend(Request $request, License $license): JsonResponse
    {
        $license->update(['status' => LicenseStatus::Suspended]);

        AuditService::log(
            admin: $request->user(),
            action: 'license.suspended',
            target: $license,
            ip: $request->ip(),
        );

        return $this->success(new LicenseResource($license->fresh()), 'License suspended successfully.');
    }

    public function revoke(Request $request, License $license): JsonResponse
    {
        $license->update(['status' => LicenseStatus::Revoked]);
        $license->devices()->update(['is_active' => false]);

        AuditService::log(
            admin: $request->user(),
            action: 'license.revoked',
            target: $license,
            ip: $request->ip(),
        );

        return $this->success(new LicenseResource($license->fresh()), 'License revoked successfully.');
    }

    public function reactivate(Request $request, License $license): JsonResponse
    {
        $license->update(['status' => LicenseStatus::Active]);

        AuditService::log(
            admin: $request->user(),
            action: 'license.reactivated',
            target: $license,
            ip: $request->ip(),
        );

        return $this->success(new LicenseResource($license->fresh()), 'License reactivated successfully.');
    }

    public function extend(ExtendLicenseRequest $request, License $license): JsonResponse
    {
        $validated = $request->validated();

        $baseDate = ($license->expires_at && $license->expires_at->isFuture())
            ? $license->expires_at
            : now();

        $license->update([
            'expires_at' => $baseDate->copy()->addYears($validated['years']),
        ]);

        AuditService::log(
            admin: $request->user(),
            action: 'license.extended',
            target: $license,
            meta: ['years_added' => $validated['years']],
            ip: $request->ip(),
        );

        return $this->success(new LicenseResource($license->fresh()), 'License extended successfully.');
    }

    public function changeSeats(ChangeSeatsRequest $request, License $license): JsonResponse
    {
        $validated = $request->validated();

        $license->update(['seat_count' => $validated['seat_count']]);

        AuditService::log(
            admin: $request->user(),
            action: 'license.seats_changed',
            target: $license,
            meta: ['new_seat_count' => $validated['seat_count']],
            ip: $request->ip(),
        );

        return $this->success(new LicenseResource($license->fresh()), 'Seat count updated successfully.');
    }
}
