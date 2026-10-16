<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly PricingService $pricingService,
    ) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $price = $this->pricingService->calculate($validated['seats'], $validated['years']);

        return DB::transaction(function () use ($validated, $user, $price, $request) {
            if ($validated['method'] === 'bank_transfer') {
                $slipPath = null;
                if ($request->hasFile('slip')) {
                    $slipPath = Storage::disk('private')->putFile('slips', $request->file('slip'));
                }

                $payment = Payment::create([
                    'user_id' => $user->id,
                    'method' => PaymentMethod::BankTransfer,
                    'status' => PaymentStatus::Pending,
                    'amount' => $price,
                    'currency' => 'USD',
                    'bank_tx_ref' => $validated['tx_ref'],
                    'bank_slip_path' => $slipPath,
                    'seat_count' => $validated['seats'],
                    'year_count' => $validated['years'],
                ]);

                return $this->success(new PaymentResource($payment), 'Payment submitted for review.', 201);
            }

            // Card payment via Stripe
            Stripe::setApiKey(config('services.stripe.secret'));

            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => "Motion AI License - {$validated['seats']} seat(s) x {$validated['years']} year(s)",
                        ],
                        'unit_amount' => (int) round($price * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('app.frontend_url') . '/dashboard?payment=success',
                'cancel_url' => config('app.frontend_url') . '/dashboard?payment=cancelled',
                'customer_email' => $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                    'seats' => $validated['seats'],
                    'years' => $validated['years'],
                ],
            ]);

            $payment = Payment::create([
                'user_id' => $user->id,
                'method' => PaymentMethod::Card,
                'status' => PaymentStatus::Pending,
                'amount' => $price,
                'currency' => 'USD',
                'stripe_session_id' => $session->id,
                'seat_count' => $validated['seats'],
                'year_count' => $validated['years'],
            ]);

            return $this->success([
                'payment' => new PaymentResource($payment),
                'checkout_url' => $session->url,
            ], 'Stripe checkout session created.');
        });
    }
}
