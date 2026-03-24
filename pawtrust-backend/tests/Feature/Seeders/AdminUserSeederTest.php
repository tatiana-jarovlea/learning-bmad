<?php

namespace Tests\Feature\Seeders;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserSeederTest extends TestCase
{
    use RefreshDatabase;

    private function seedAdmin(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(AdminUserSeeder::class);
    }

    public function test_seeder_creates_admin_user(): void
    {
        config(['app.admin_email' => 'admin@test.com', 'app.admin_password' => 'Secret123!']);

        $this->seedAdmin();

        $user = User::where('email', 'admin@test.com')->first();

        $this->assertNotNull($user);
        $this->assertEquals('admin', $user->role);
        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_seeder_is_idempotent(): void
    {
        config(['app.admin_email' => 'admin@test.com', 'app.admin_password' => 'Secret123!']);

        $this->seedAdmin();
        $this->seedAdmin();

        $this->assertEquals(1, User::where('email', 'admin@test.com')->count());
    }

    public function test_admin_can_login(): void
    {
        config(['app.admin_email' => 'admin@test.com', 'app.admin_password' => 'Secret123!']);

        $this->seedAdmin();

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'admin@test.com',
            'password' => 'Secret123!',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.role', 'admin');
    }

    public function test_seeder_skips_when_env_not_set(): void
    {
        config(['app.admin_email' => null, 'app.admin_password' => null]);

        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(AdminUserSeeder::class);

        $this->assertEquals(0, User::count());
    }
}
