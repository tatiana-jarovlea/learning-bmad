<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name'                  => 'Ion Popescu',
            'email'                 => 'ion@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'buyer',
        ], $overrides);
    }

    public function test_user_can_register_as_buyer(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email', 'role']]]);

        $this->assertDatabaseHas('users', ['email' => 'ion@example.com', 'role' => 'buyer']);
    }

    public function test_user_can_register_as_breeder(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload(['role' => 'breeder']));

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'ion@example.com', 'role' => 'breeder']);
    }

    public function test_user_can_register_as_sitter(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload(['role' => 'sitter']));

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'ion@example.com', 'role' => 'sitter']);
    }

    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'ion@example.com']);

        $response = $this->postJson('/api/v1/auth/register', $this->validPayload());

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_registration_fails_with_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload([
            'password'              => 'abc',
            'password_confirmation' => 'abc',
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    public function test_registration_fails_with_invalid_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload(['role' => 'admin']));

        $response->assertStatus(422)->assertJsonValidationErrors(['role']);
    }

    public function test_password_is_hashed_in_database(): void
    {
        $this->postJson('/api/v1/auth/register', $this->validPayload());

        $user = User::where('email', 'ion@example.com')->firstOrFail();

        $this->assertNotEquals('password123', $user->password);
        $this->assertTrue(password_verify('password123', $user->password));
    }
}
