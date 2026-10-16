<?php

namespace App\Services;

use App\Models\AdminAuditLog;

class AuditService
{
    public static function log(
        int $adminId,
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?array $meta = null,
    ): AdminAuditLog {
        return AdminAuditLog::create([
            'admin_id' => $adminId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'meta' => $meta,
            'ip' => request()->ip(),
        ]);
    }
}
