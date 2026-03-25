<?php

namespace Tests\Feature\Admin;

use App\Models\BreederDocument;
use App\Models\BreederProfile;
use App\Models\User;
use App\Models\VerificationRequest;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVerificationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private VerificationRequest $vr;
    private User $breeder;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->admin->assignRole('admin');

        $this->breeder = User::factory()->create(['role' => 'breeder']);
        $this->breeder->assignRole('breeder');
        $profile = BreederProfile::factory()->create(['user_id' => $this->breeder->id]);
        $doc     = BreederDocument::factory()->create(['breeder_profile_id' => $profile->id]);
        $this->vr = VerificationRequest::factory()->create([
            'breeder_profile_id' => $profile->id,
            'status'             => 'pending',
        ]);
        $this->vr->documents()->attach($doc->id);
    }

    public function test_admin_can_list_verification_requests(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/verification-requests')
            ->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'status', 'breeder', 'documents']]]);
    }

    public function test_admin_can_filter_by_status(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/verification-requests?status=pending')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/verification-requests?status=approved')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_breeder_cannot_access_admin_verification_list(): void
    {
        $breeder = User::factory()->create(['role' => 'breeder']);
        $breeder->assignRole('breeder');

        $this->actingAs($breeder, 'sanctum')
            ->getJson('/api/v1/admin/verification-requests')
            ->assertStatus(403);
    }

    public function test_admin_can_set_under_review(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'under_review',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'under_review');

        $this->assertDatabaseHas('verification_requests', [
            'id'     => $this->vr->id,
            'status' => 'under_review',
        ]);
    }

    public function test_admin_can_approve_verification(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'approved',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertNotNull($this->vr->breederProfile->fresh()->verified_at);
    }

    public function test_approval_immediately_reflects_on_public_profile(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'approved',
            ]);

        // Public profile is looked up by user_id
        $this->getJson("/api/v1/breeders/{$this->breeder->id}")
            ->assertJsonPath('data.verified', true);
    }

    public function test_admin_can_reject_with_notes(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'rejected',
                'notes'  => 'Documents are illegible. Please resubmit clear copies.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('verification_requests', [
            'id'     => $this->vr->id,
            'status' => 'rejected',
        ]);
    }

    public function test_rejection_requires_notes(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'rejected',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['notes']);
    }

    public function test_rejection_notes_min_20_chars(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'rejected',
                'notes'  => 'Too short.',
            ])
            ->assertStatus(422);
    }

    public function test_rejection_does_not_set_verified_at(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'rejected',
                'notes'  => 'Documents are incomplete and not legible.',
            ]);

        $this->assertNull($this->vr->breederProfile->fresh()->verified_at);
    }

    public function test_admin_can_get_document_preview_url(): void
    {
        $doc = $this->vr->documents->first();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/documents/{$doc->id}/preview")
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['url', 'expires_at']]);
    }

    public function test_breeder_cannot_get_document_preview_url(): void
    {
        $doc     = $this->vr->documents->first();
        $breeder = User::factory()->create(['role' => 'breeder']);
        $breeder->assignRole('breeder');

        $this->actingAs($breeder, 'sanctum')
            ->getJson("/api/v1/admin/documents/{$doc->id}/preview")
            ->assertStatus(403);
    }

    public function test_audit_log_created_on_review(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'approved',
            ]);

        $this->assertDatabaseHas('admin_audit_logs', [
            'admin_user_id' => $this->admin->id,
            'action'        => 'verification.approved',
            'target_type'   => 'VerificationRequest',
            'target_id'     => $this->vr->id,
        ]);
    }
}
