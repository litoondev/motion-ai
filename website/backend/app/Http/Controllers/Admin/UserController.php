<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangeRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sortBy = in_array($request->input('sort_by'), ['created_at', 'name', 'email', 'role', 'status'], true)
            ? $request->input('sort_by') : 'created_at';
        $sortDir = $request->input('sort_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $users = $query->paginate(min((int) $request->input('per_page', 15), 100));

        return $this->success(UserResource::collection($users)->response()->getData(true));
    }

    public function show(User $user): JsonResponse
    {
        $user->loadCount(['licenses', 'devices', 'payments']);

        return $this->success(new UserResource($user));
    }

    public function block(Request $request, User $user): JsonResponse
    {
        $user->update(['status' => UserStatus::Blocked]);
        $user->tokens()->delete();

        AuditService::log(
            admin: $request->user(),
            action: 'user.blocked',
            target: $user,
            ip: $request->ip(),
        );

        return $this->success(new UserResource($user->fresh()), 'User blocked successfully.');
    }

    public function unblock(Request $request, User $user): JsonResponse
    {
        $user->update(['status' => UserStatus::Active]);

        AuditService::log(
            admin: $request->user(),
            action: 'user.unblocked',
            target: $user,
            ip: $request->ip(),
        );

        return $this->success(new UserResource($user->fresh()), 'User unblocked successfully.');
    }

    public function changeRole(ChangeRoleRequest $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id && $request->validated()['role'] !== Role::Admin->value) {
            return $this->error('You cannot remove your own admin role.', 422);
        }

        $newRole = Role::from($request->validated()['role']);
        $user->update(['role' => $newRole]);

        AuditService::log(
            admin: $request->user(),
            action: 'user.role_changed',
            target: $user,
            meta: ['new_role' => $newRole->value],
            ip: $request->ip(),
        );

        return $this->success(new UserResource($user->fresh()), 'User role updated successfully.');
    }
}
