<?php

namespace App\Http\Controllers\Api;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\Payment;
use App\Services\LicenseKeyGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return $this->error('Invalid signature.', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            $payment = Payment::where('stripe_session_id', $session->id)->first();

            if (!$payment) {
                Log::warning('Stripe webhook: payment not found for session ' . $session->id);
                return $this->success(null, 'Payment not found, ignored.');
            }

            // Idempotent check
            if ($payment->status === PaymentStatus::Approved) {
                return $this->success(null, 'Already processed.');
            }

            DB::transaction(function () use ($payment, $session) {
                $payment = Payment::where('id', $payment->id)->lockForUpdate()->first();

                if ($payment->status !== PaymentStatus::Pending) {
                    return;
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
                    'stripe_tx_id' => $session->payment_intent ?? null,
                ]);
            });
        }

        return $this->success(null, 'Webhook handled.');
    }
}
