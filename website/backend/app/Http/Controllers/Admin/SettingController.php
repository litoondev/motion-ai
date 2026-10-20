<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all();

        return $this->success(SettingResource::collection($settings));
    }

    public function update(UpdateSettingRequest $request): JsonResponse
    {
        $validated = $request->validated();

        foreach ($validated['settings'] as $key => $value) {
            Setting::set($key, $value);
        }

        AuditService::log(
            admin: $request->user(),
            action: 'settings.updated',
            meta: ['keys' => array_keys($validated['settings'])],
            ip: $request->ip(),
        );

        return $this->success(null, 'Settings updated successfully.');
    }

    public function uploadPlugin(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:zip', 'max:102400'],
        ]);

        Storage::disk('private')->putFileAs('plugin', $request->file('file'), 'motion-ai-plugin.zip');

        AuditService::log(
            admin: $request->user(),
            action: 'plugin.uploaded',
            ip: $request->ip(),
        );

        return $this->success(null, 'Plugin uploaded successfully.');
    }
}
