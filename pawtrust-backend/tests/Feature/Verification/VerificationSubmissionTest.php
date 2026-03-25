<?php

namespace Tests\Feature\Verification;

use App\Models\BreederDocument;
use App\Models\BreederProfile;
use App\Models\User;
use App\Models\VerificationRequest;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerificationSubmissionTest extends TestCase
{
    use RefreshDatabase;

    private User $breeder;
    private BreederProfile $profile;
    private BreederDocument $doc;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->breeder = User::factory()->create(['role' => 'breeder']);
        $this->breeder->assignRole('breeder');
        $this->profile = BreederProfile::factory()->create(['user_id' => $this->breeder->id]);
        $this->doc = BreederDocument::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'pending',
        ]);
    }

    public function test_breeder_can_submit_verification_request(): void
    {
        $this->actingAs($this->breeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$this->doc->id],
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('verification_requests', [
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'pending',
        ]);
    }

    public function test_requires_at_least_one_document(): void
    {
        $this->actingAs($this->breeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['document_ids']);
    }

    public function test_cannot_submit_with_another_breeders_document(): void
    {
        $other        = User::factory()->create(['role' => 'breeder']);
        $otherProfile = BreederProfile::factory()->create(['user_id' => $other->id]);
        $otherDoc     = BreederDocument::factory()->create(['breeder_profile_id' => $otherProfile->id]);

        $this->actingAs($this->breeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$otherDoc->id],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['document_ids']);
    }

    public function test_cannot_submit_with_soft_deleted_document(): void
    {
        $this->doc->delete();

        $this->actingAs($this->breeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$this->doc->id],
            ])
            ->assertStatus(422);
    }

    public function test_cannot_resubmit_while_pending(): void
    {
        VerificationRequest::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'pending',
        ]);

        $this->actingAs($this->breeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$this->doc->id],
            ])
            ->assertStatus(422);
    }

    public function test_cannot_resubmit_while_under_review(): void
    {
        VerificationRequest::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'under_review',
        ]);

        $this->actingAs($this->breeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$this->doc->id],
            ])
            ->assertStatus(422);
    }

    public function test_can_resubmit_after_rejection(): void
    {
        VerificationRequest::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'rejected',
            'admin_notes'        => 'Documents illegible. Please resubmit.',
        ]);

        $this->actingAs($this->breeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$this->doc->id],
            ])
            ->assertStatus(201);

        $this->assertDatabaseCount('verification_requests', 2);
    }

    public function test_status_endpoint_returns_not_submitted_for_new_breeder(): void
    {
        $this->actingAs($this->breeder, 'sanctum')
            ->getJson('/api/v1/verification-requests/status')
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'not_submitted');
    }

    public function test_status_endpoint_returns_pending_after_submission(): void
    {
        VerificationRequest::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'pending',
        ]);

        $this->actingAs($this->breeder, 'sanctum')
            ->getJson('/api/v1/verification-requests/status')
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_status_endpoint_returns_verified_for_verified_breeder(): void
    {
        $this->profile->update(['verified_at' => now()]);

        $this->actingAs($this->breeder, 'sanctum')
            ->getJson('/api/v1/verification-requests/status')
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'verified');
    }

    public function test_rejection_notes_visible_in_status_response(): void
    {
        VerificationRequest::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'rejected',
            'admin_notes'        => 'Certificate expired.',
        ]);

        $this->actingAs($this->breeder, 'sanctum')
            ->getJson('/api/v1/verification-requests/status')
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.admin_notes', 'Certificate expired.');
    }

    public function test_buyer_cannot_submit_verification_request(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $buyer->assignRole('buyer');

        $this->actingAs($buyer, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$this->doc->id],
            ])
            ->assertStatus(403);
    }
}
