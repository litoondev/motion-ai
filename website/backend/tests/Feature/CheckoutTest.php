<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\SettingSeeder::class);
    }

    public static function manualMethods(): array
    {
        return [['bank_transfer'], ['bkash'], ['payoneer'], ['wise']];
    }

    #[DataProvider('manualMethods')]
    public function test_manual_payment_methods_create_pending_payment(string $method): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/checkout', [
            'seats' => 2,
            'years' => 1,
            'method' => $method,
            'tx_ref' => 'TX-123',
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'method' => $method,
            'status' => 'pending',
            'bank_tx_ref' => 'TX-123',
            'seat_count' => 2,
        ]);
    }

    #[DataProvider('manualMethods')]
    public function test_manual_payment_requires_transaction_reference(string $method): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/checkout', ['seats' => 1, 'years' => 1, 'method' => $method])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('tx_ref');
    }

    public function test_unknown_payment_method_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/checkout', ['seats' => 1, 'years' => 1, 'method' => 'paypal', 'tx_ref' => 'X'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('method');
    }
}
