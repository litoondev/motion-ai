<?php

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\DownloadController;
use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\LicenseVerifyController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\TrialController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\DeviceController as AdminDeviceController;
use App\Http\Controllers\Admin\LicenseController as AdminLicenseController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Admin\StatsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes are loaded by bootstrap/app.php with the 'api/v1' prefix.
|
*/

Route::get('/ping', fn () => response()->json([
    'success' => true,
    'message' => 'Motion AI API is running.',
]));

// Public
Route::post('/license/verify', [LicenseVerifyController::class, 'verify'])->middleware('throttle:30,1');
Route::get('/pricing', [PricingController::class, 'index']);

// Legacy path (/api/license/verify) is registered in bootstrap/app.php (outside the /api/v1 prefix)

// Auth
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/google', [AuthController::class, 'google'])->middleware('throttle:10,1');
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
    Route::get('/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])->middleware(['signed'])->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->middleware('throttle:3,1');
    });
});

// Authenticated user API
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me/dashboard', [DashboardController::class, 'index']);
    Route::patch('/me', [ProfileController::class, 'update']);
    Route::post('/trial/activate', [TrialController::class, 'activate']);
    Route::get('/licenses', [LicenseController::class, 'index']);
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::post('/devices/{device}/unlink', [DeviceController::class, 'unlink']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/download', [DownloadController::class, 'download']);
});

// Stripe webhook (no auth, verified by signature)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// Admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [StatsController::class, 'index']);

    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::get('/{user}', [AdminUserController::class, 'show']);
        Route::post('/{user}/block', [AdminUserController::class, 'block']);
        Route::post('/{user}/unblock', [AdminUserController::class, 'unblock']);
        Route::patch('/{user}/role', [AdminUserController::class, 'changeRole']);
    });

    Route::prefix('licenses')->group(function () {
        Route::get('/', [AdminLicenseController::class, 'index']);
        Route::get('/{license}', [AdminLicenseController::class, 'show']);
        Route::post('/', [AdminLicenseController::class, 'generate']);
        Route::post('/{license}/suspend', [AdminLicenseController::class, 'suspend']);
        Route::post('/{license}/revoke', [AdminLicenseController::class, 'revoke']);
        Route::post('/{license}/reactivate', [AdminLicenseController::class, 'reactivate']);
        Route::post('/{license}/extend', [AdminLicenseController::class, 'extend']);
        Route::patch('/{license}/seats', [AdminLicenseController::class, 'changeSeats']);
    });

    Route::prefix('devices')->group(function () {
        Route::get('/', [AdminDeviceController::class, 'index']);
        Route::post('/{device}/unlink', [AdminDeviceController::class, 'forceUnlink']);
    });

    Route::prefix('payments')->group(function () {
        Route::get('/', [AdminPaymentController::class, 'index']);
        Route::get('/{payment}', [AdminPaymentController::class, 'show']);
        Route::get('/{payment}/slip', [AdminPaymentController::class, 'showSlip']);
        Route::post('/{payment}/approve', [AdminPaymentController::class, 'approve']);
        Route::post('/{payment}/reject', [AdminPaymentController::class, 'reject']);
        Route::post('/{payment}/refund', [AdminPaymentController::class, 'refund']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/', [AdminSettingController::class, 'index']);
        Route::put('/', [AdminSettingController::class, 'update']);
        Route::post('/plugin', [AdminSettingController::class, 'uploadPlugin']);
    });

    Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
});
