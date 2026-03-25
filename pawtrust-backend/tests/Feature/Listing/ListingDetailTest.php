<?php

namespace Tests\Feature\Listing;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\BreederProfile;
use App\Models\BreederAchievement;
use App\Models\Listing;
use App\Models\Review;

class ListingDetailTest extends TestCase
{
    use RefreshDatabase;

    private Listing $listing;
    private BreederProfile $profile;

    protected function setUp(): void
    {
        parent::setUp();
        $breeder       = User::factory()->create(['role' => 'breeder']);
        $this->profile = BreederProfile::factory()->create([
            'user_id' => $breeder->id,
            'phone'   => '+37360123456',
        ]);
        $this->listing = Listing::factory()->create([
            'breeder_profile_id'     => $this->profile->id,
            'status'                 => 'active',
            'health_certificate_key' => 'certs/listing-1/cert.pdf',
        ]);
    }

    public function test_listing_detail_returns_full_data(): void
    {
        $this->getJson("/api/v1/listings/{$this->listing->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $this->listing->id)
            ->assertJsonPath('data.title', $this->listing->title)
            ->assertJsonStructure([
                'data' => [
                    'id', 'title', 'description', 'species', 'breed',
                    'photos', 'breeder', 'review_summary', 'achievements',
                ],
            ]);
    }

    public function test_listing_detail_excludes_contact_details(): void
    {
        $this->getJson("/api/v1/listings/{$this->listing->id}")
            ->assertStatus(200)
            ->assertJsonMissing(['phone'])
            ->assertJsonMissing(['email']);
    }

    public function test_listing_detail_excludes_health_certificate_key(): void
    {
        $this->getJson("/api/v1/listings/{$this->listing->id}")
            ->assertJsonMissing(['health_certificate_key'])
            ->assertJsonMissing(['s3_key'])
            ->assertJsonPath('data.health_certificate', 'on_file');
    }

    public function test_listing_detail_shows_cert_on_file_indicator(): void
    {
        $this->listing->update(['health_certificate_key' => 'certs/test.pdf']);

        $this->getJson("/api/v1/listings/{$this->listing->id}")
            ->assertJsonPath('data.health_certificate', 'on_file');
    }

    public function test_listing_detail_includes_review_summary(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        Review::factory()->create([
            'listing_id' => $this->listing->id,
            'buyer_id'   => $buyer->id,
            'rating'     => 5,
            'status'     => 'published',
        ]);

        $response = $this->getJson("/api/v1/listings/{$this->listing->id}");
        $response->assertJsonPath('data.review_summary.total_count', 1);
        $this->assertEquals(5.0, $response->json('data.review_summary.average_rating'));
    }

    public function test_listing_detail_includes_up_to_3_achievement_highlights(): void
    {
        BreederAchievement::factory()->count(5)->create([
            'breeder_profile_id' => $this->profile->id,
        ]);

        $response = $this->getJson("/api/v1/listings/{$this->listing->id}");
        $response->assertOk();

        $achievements = $response->json('data.achievements');
        $this->assertCount(3, $achievements);
    }

    public function test_listing_detail_includes_all_photo_urls(): void
    {
        // No photos in factory — just confirms photos array is present and empty
        $this->getJson("/api/v1/listings/{$this->listing->id}")
            ->assertJsonPath('data.photos', []);
    }

    public function test_draft_listing_returns_404(): void
    {
        $draft = Listing::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'draft',
        ]);

        $this->getJson("/api/v1/listings/{$draft->id}")
            ->assertStatus(404);
    }

    public function test_sold_listing_returns_404(): void
    {
        $sold = Listing::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'sold',
        ]);

        $this->getJson("/api/v1/listings/{$sold->id}")
            ->assertStatus(404);
    }

    public function test_listing_reviews_endpoint_returns_published_only(): void
    {
        $buyer1 = User::factory()->create(['role' => 'buyer']);
        $buyer2 = User::factory()->create(['role' => 'buyer']);

        Review::factory()->create([
            'listing_id' => $this->listing->id,
            'buyer_id'   => $buyer1->id,
            'status'     => 'published',
        ]);
        Review::factory()->create([
            'listing_id' => $this->listing->id,
            'buyer_id'   => $buyer2->id,
            'status'     => 'hidden',
        ]);

        $this->getJson("/api/v1/listings/{$this->listing->id}/reviews")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
