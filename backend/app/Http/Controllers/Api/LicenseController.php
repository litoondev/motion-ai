<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LicenseResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $licenses = $request->user()
            ->licenses()
            ->withCount(['devices as active_device_count' => function ($query) {
                $query->where('is_active', true);
            }])
            ->latest()
            ->paginate(15);

        return $this->success(LicenseResource::collection($licenses)->response()->getData(true));
    }
}
