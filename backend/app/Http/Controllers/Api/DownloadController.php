<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadController extends Controller
{
    public function download(Request $request): \Illuminate\Http\JsonResponse|StreamedResponse
    {
        $user = $request->user();

        if (!$user->hasActiveLicense()) {
            return $this->error('You need an active license to download the plugin.', 403);
        }

        $filePath = env('PLUGIN_FILE_PATH', 'plugin/motion-ai-plugin.zip');

        if (!Storage::disk('private')->exists($filePath)) {
            return $this->error('Plugin file not found.', 404);
        }

        return Storage::disk('private')->download($filePath, 'motion-ai-plugin.zip');
    }
}
