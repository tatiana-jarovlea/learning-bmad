<?php

namespace Tests\Feature\Verification;

use App\Mail\AdminNewVerificationRequestMail;
use App\Mail\BreederVerificationApprovedMail;
use App\Mail\BreederVerificationRejectedMail;
use App\Mail\BreederVerificationUnderReviewMail;
use App\Models\BreederDocument;
use App\Models\BreederProfile;
use App\Models\User;
use App\Models\VerificationRequest;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class VerificationNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $breeder;
    private BreederProfile $profile;
    private VerificationRequest $vr;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        Mail::fake();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->admin->assignRole('admin');

        $this->breeder = User::factory()->create(['role' => 'breeder', 'locale' => 'ro']);
        $this->breeder->assignRole('breeder');
        $this->profile = BreederProfile::factory()->create(['user_id' => $this->breeder->id]);
        $this->vr = VerificationRequest::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'pending',
        ]);
    }

    public function test_admin_notified_when_breeder_submits_verification(): void
    {
        // Use a fresh breeder with no existing pending VR (setUp creates one on $this->breeder)
        $freshBreeder = User::factory()->create(['role' => 'breeder']);
        $freshBreeder->assignRole('breeder');
        $freshProfile = BreederProfile::factory()->create(['user_id' => $freshBreeder->id]);
        $doc = BreederDocument::factory()->create([
            'breeder_profile_id' => $freshProfile->id,
        ]);

        $this->actingAs($freshBreeder, 'sanctum')
            ->postJson('/api/v1/verification-requests', [
                'document_ids' => [$doc->id],
            ])
            ->assertStatus(201);

        Mail::assertQueued(AdminNewVerificationRequestMail::class, function ($mail) {
            return $mail->hasTo(config('app.admin_notification_email'));
        });
    }

    public function test_breeder_notified_when_status_set_to_under_review(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'under_review',
            ]);

        Mail::assertQueued(BreederVerificationUnderReviewMail::class, function ($mail) {
            return $mail->hasTo($this->breeder->email);
        });
    }

    public function test_breeder_notified_on_approval(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'approved',
            ]);

        Mail::assertQueued(BreederVerificationApprovedMail::class, function ($mail) {
            return $mail->hasTo($this->breeder->email);
        });
    }

    public function test_approval_notification_contains_profile_url(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'approved',
            ]);

        Mail::assertQueued(BreederVerificationApprovedMail::class, function ($mail) {
            return str_contains($mail->profileUrl, '/breeders/' . $this->profile->user_id);
        });
    }

    public function test_breeder_notified_on_rejection(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'rejected',
                'notes'  => 'Documents are illegible. Please resubmit clear copies.',
            ]);

        Mail::assertQueued(BreederVerificationRejectedMail::class, function ($mail) {
            return $mail->hasTo($this->breeder->email);
        });
    }

    public function test_rejection_notification_contains_admin_notes(): void
    {
        $notes = 'Documents are illegible. Please resubmit clear copies.';

        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'rejected',
                'notes'  => $notes,
            ]);

        Mail::assertQueued(BreederVerificationRejectedMail::class, function ($mail) use ($notes) {
            return $mail->admin_notes === $notes;
        });
    }

    public function test_notification_sent_in_breeder_locale_ro(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'approved',
            ]);

        Mail::assertQueued(BreederVerificationApprovedMail::class, function ($mail) {
            return $mail->locale === 'ro';
        });
    }

    public function test_notification_sent_in_breeder_locale_ru(): void
    {
        $this->breeder->update(['locale' => 'ru']);

        $vr = VerificationRequest::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'pending',
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$vr->id}/review", [
                'status' => 'approved',
            ]);

        Mail::assertQueued(BreederVerificationApprovedMail::class, function ($mail) {
            return $mail->locale === 'ru';
        });
    }

    public function test_no_notification_sent_on_invalid_status_update(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/verification-requests/{$this->vr->id}/review", [
                'status' => 'invalid_status',
            ])
            ->assertStatus(422);

        Mail::assertNothingQueued();
    }
}
