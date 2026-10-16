<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AdminAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AdminAuditLog::with('admin');

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        if ($adminId = $request->input('admin_id')) {
            $query->where('admin_id', $adminId);
        }

        if ($from = $request->input('from')) {
            $query->where('created_at', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->where('created_at', '<=', $to);
        }

        $logs = $query->latest()->paginate($request->input('per_page', 15));

        return $this->success(AuditLogResource::collection($logs)->response()->getData(true));
    }
}
