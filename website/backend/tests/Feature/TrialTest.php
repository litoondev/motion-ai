<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrialTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\SettingSeeder::class);
    }

    public function test_user_can_activate_trial(): void
    {
        $user = User::factory()->create(['trial_used' => false]);

        $response = $this->actingAs($user)->postJson('/api/v1/trial/activate');

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $user->refresh();
        $this->assertTrue($user->trial_used);
        $this->assertNotNull($user->trial_started_at);
        $this->assertDatabaseHas('licenses', [
            'user_id' => $user->id,
            'type' => 'trial',
            'seat_count' => 1,
        ]);
    }

    public function test_user_cannot_activate_trial_twice(): void
    {
        $user = User::factory()->create(['trial_used' => true]);

        $response = $this->actingAs($user)->postJson('/api/v1/trial/activate');

        $response->assertStatus(409);
    }

    public function test_trial_requires_auth(): void
    {
        $response = $this->postJson('/api/v1/trial/activate');
        $response->assertUnauthorized();
    }
}
