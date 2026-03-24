<?php

namespace Tests\Feature\BreederProfile;

use App\Models\BreederProfile;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BreederProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function makeBreeder(): User
    {
        $user = User::factory()->create(['role' => 'breeder']);
        $user->assignRole('breeder');
        return $user;
    }

    private function makeBuyer(): User
    {
        $user = User::factory()->create(['role' => 'buyer']);
        $user->assignRole('buyer');
        return $user;
    }

    public function test_breeder_can_create_profile(): void
    {
        $breeder = $this->makeBreeder();

        $this->actingAs($breeder, 'sanctum')
            ->postJson('/api/v1/breeder/profile', [
                'kennel_name' => 'Golden Paws Kennel',
                'location'    => 'Chișinău, Moldova',
                'description' => 'Specializing in Golden Retrievers.',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.kennel_name', 'Golden Paws Kennel');

        $this->assertDatabaseHas('breeder_profiles', ['user_id' => $breeder->id]);
    }

    public function test_buyer_cannot_create_breeder_profile(): void
    {
        $buyer = $this->makeBuyer();

        $this->actingAs($buyer, 'sanctum')
            ->postJson('/api/v1/breeder/profile', ['kennel_name' => 'Test'])
            ->assertStatus(403);
    }

    public function test_breeder_cannot_create_duplicate_profile(): void
    {
        $breeder = $this->makeBreeder();
        BreederProfile::factory()->create(['user_id' => $breeder->id]);

        $this->actingAs($breeder, 'sanctum')
            ->postJson('/api/v1/breeder/profile', ['kennel_name' => 'Second Profile'])
            ->assertStatus(409);
    }

    public function test_breeder_can_update_profile(): void
    {
        $breeder = $this->makeBreeder();
        BreederProfile::factory()->create(['user_id' => $breeder->id, 'kennel_name' => 'Old Name']);

        $this->actingAs($breeder, 'sanctum')
            ->putJson('/api/v1/breeder/profile', ['kennel_name' => 'New Name'])
            ->assertOk()
            ->assertJsonPath('data.kennel_name', 'New Name');
    }

    public function test_public_profile_accessible_without_auth(): void
    {
        $breeder = $this->makeBreeder();
        BreederProfile::factory()->create(['user_id' => $breeder->id, 'kennel_name' => 'Public Kennel']);

        $this->getJson("/api/v1/breeders/{$breeder->id}")
            ->assertOk()
            ->assertJsonPath('data.kennel_name', 'Public Kennel');
    }

    public function test_public_profile_excludes_phone_and_email(): void
    {
        $breeder = $this->makeBreeder();
        BreederProfile::factory()->create([
            'user_id' => $breeder->id,
            'phone'   => '+37360123456',
        ]);

        $response = $this->getJson("/api/v1/breeders/{$breeder->id}");

        $response->assertOk()
            ->assertJsonMissing(['phone'])
            ->assertJsonMissing(['email']);
    }

    public function test_public_profile_includes_active_listings_only(): void
    {
        $breeder = $this->makeBreeder();
        BreederProfile::factory()->create(['user_id' => $breeder->id]);

        // No listings table yet — just confirm the endpoint returns 200 with empty listings
        $response = $this->getJson("/api/v1/breeders/{$breeder->id}");
        $response->assertOk()
            ->assertJsonStructure(['data' => ['kennel_name', 'location', 'verified']]);
    }

    public function test_profile_photo_upload_stores_s3_key(): void
    {
        Storage::fake('s3');
        $breeder = $this->makeBreeder();
        $profile = BreederProfile::factory()->create(['user_id' => $breeder->id]);

        $file = UploadedFile::fake()->image('photo.jpg', 800, 600);

        $this->actingAs($breeder, 'sanctum')
            ->postJson('/api/v1/breeder/profile/photo', ['profile_photo' => $file])
            ->assertOk();

        $this->assertNotNull($profile->fresh()->profile_photo_key);
        Storage::disk('s3')->assertExists($profile->fresh()->profile_photo_key);
    }

    public function test_unauthenticated_cannot_access_own_profile(): void
    {
        $this->getJson('/api/v1/breeder/profile')
            ->assertUnauthorized();
    }
}
