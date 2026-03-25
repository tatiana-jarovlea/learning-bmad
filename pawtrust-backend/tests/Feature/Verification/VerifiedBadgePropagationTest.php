<?php

namespace Tests\Feature\Verification;

use App\Models\BreederProfile;
use App\Models\Listing;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerifiedBadgePropagationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_public_breeder_profile_shows_verified_false_before_approval(): void
    {
        $breeder = User::factory()->create(['role' => 'breeder']);
        BreederProfile::factory()->create([
            'user_id'     => $breeder->id,
            'verified_at' => null,
        ]);

        $this->getJson("/api/v1/breeders/{$breeder->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.verified', false);
    }

    public function test_public_breeder_profile_shows_verified_true_after_approval(): void
    {
        $breeder = User::factory()->create(['role' => 'breeder']);
        BreederProfile::factory()->create([
            'user_id'     => $breeder->id,
            'verified_at' => now(),
        ]);

        $this->getJson("/api/v1/breeders/{$breeder->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.verified', true)
            ->assertJsonStructure(['data' => ['verified_since']]);
    }

    public function test_listing_card_includes_breeder_verified_field(): void
    {
        $breeder = User::factory()->create(['role' => 'breeder']);
        $profile = BreederProfile::factory()->create([
            'user_id'     => $breeder->id,
            'verified_at' => now(),
        ]);
        Listing::factory()->create(['breeder_profile_id' => $profile->id, 'status' => 'active']);

        // Listing cards use ListingCardResource: verified is a top-level field
        $this->getJson('/api/v1/listings')
            ->assertStatus(200)
            ->assertJsonPath('data.0.verified', true);
    }

    public function test_listing_detail_includes_breeder_verified_field(): void
    {
        $breeder = User::factory()->create(['role' => 'breeder']);
        $profile = BreederProfile::factory()->create([
            'user_id'     => $breeder->id,
            'verified_at' => null,
        ]);
        $listing = Listing::factory()->create([
            'breeder_profile_id' => $profile->id,
            'status'             => 'active',
        ]);

        $this->getJson("/api/v1/listings/{$listing->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.breeder.verified', false);
    }
}
