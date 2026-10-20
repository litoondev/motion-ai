<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\License;
use App\Models\Payment;
use App\Services\AuditService;
use App\Services\LicenseKeyGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with('user');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($method = $request->input('method')) {
            $query->where('method', $method);
        }

        if ($from = $request->input('from')) {
            $query->where('created_at', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->where('created_at', '<=', $to);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('bank_tx_ref', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('email', 'like', "%{$search}%");
                  });
            });
        }

        $sortBy = in_array($request->input('sort_by'), ['created_at', 'amount', 'status', 'method'], true)
            ? $request->input('sort_by') : 'created_at';
        $sortDir = $request->input('sort_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $payments = $query->paginate(min((int) $request->input('per_page', 15), 100));

        return $this->success(PaymentResource::collection($payments)->response()->getData(true));
    }

    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['user', 'license', 'reviewer']);

        return $this->success(new PaymentResource($payment));
    }

    public function showSlip(Payment $payment): \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
    {
        if (!$payment->bank_slip_path) {
            return $this->error('No slip attached to this payment.', 404);
        }

        if (!Storage::disk('private')->exists($payment->bank_slip_path)) {
            return $this->error('Slip file not found.', 404);
        }

        return Storage::disk('private')->download($payment->bank_slip_path);
    }

    public function approve(ReviewPaymentRequest $request, Payment $payment): JsonResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($request, $payment, $validated) {
            $payment = Payment::where('id', $payment->id)->lockForUpdate()->first();

            if ($payment->status !== PaymentStatus::Pending) {
                return $this->success(new PaymentResource($payment), 'Payment already processed.');
            }

            $license = License::create([
                'user_id' => $payment->user_id,
                'type' => LicenseType::Paid,
                'status' => LicenseStatus::Active,
                'license_key' => LicenseKeyGenerator::generate(),
                'seat_count' => $payment->seat_count,
                'purchased_at' => now(),
                'expires_at' => now()->addYears($payment->year_count),
                'updated_until' => now()->addYear(),
            ]);

            $payment->update([
                'status' => PaymentStatus::Approved,
                'license_id' => $license->id,
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
                'admin_note' => $validated['note'] ?? null,
            ]);

            AuditService::log(
                admin: $request->user(),
                action: 'payment.approved',
                target: $payment,
                meta: ['license_id' => $license->id],
                ip: $request->ip(),
            );

            return $this->success(new PaymentResource($payment->fresh()->load(['user', 'license'])), 'Payment approved and license created.');
        });
    }

    public function reject(ReviewPaymentRequest $request, Payment $payment): JsonResponse
    {
        $validated = $request->validated();

        if ($payment->status !== PaymentStatus::Pending) {
            return $this->success(new PaymentResource($payment), 'Payment already processed.');
        }

        $payment->update([
            'status' => PaymentStatus::Rejected,
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
            'admin_note' => $validated['note'] ?? null,
        ]);

        AuditService::log(
            admin: $request->user(),
            action: 'payment.rejected',
            target: $payment,
            ip: $request->ip(),
        );

        return $this->success(new PaymentResource($payment->fresh()), 'Payment rejected.');
    }

    public function refund(Request $request, Payment $payment): JsonResponse
    {
        $payment->update([
            'status' => PaymentStatus::Refunded,
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        if ($payment->license_id) {
            License::where('id', $payment->license_id)->update(['status' => LicenseStatus::Revoked]);
        }

        AuditService::log(
            admin: $request->user(),
            action: 'payment.refunded',
            target: $payment,
            ip: $request->ip(),
        );

        return $this->success(new PaymentResource($payment->fresh()), 'Payment refunded.');
    }
}
