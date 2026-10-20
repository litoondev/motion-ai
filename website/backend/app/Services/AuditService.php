<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    public static function log(
        User $admin,
        string $action,
        ?Model $target = null,
        ?array $meta = null,
        ?string $ip = null,
    ): AdminAuditLog {
        return AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => $action,
            'target_type' => $target ? class_basename($target) : null,
            'target_id' => $target?->getKey(),
            'meta' => $meta,
            'ip' => $ip ?? request()->ip(),
        ]);
    }
}
