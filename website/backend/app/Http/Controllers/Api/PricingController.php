<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;

class PricingController extends Controller
{
    public function __construct(
        private readonly PricingService $pricingService,
    ) {}

    public function index(): JsonResponse
    {
        return $this->success($this->pricingService->getPricing());
    }
}
