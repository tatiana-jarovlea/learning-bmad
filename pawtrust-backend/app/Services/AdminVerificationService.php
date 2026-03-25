<?php

namespace App\Services;

use App\Models\BreederDocument;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminVerificationService
{
    public function __construct(
        private readonly S3Service $s3Service,
        private readonly VerificationNotificationService $notificationService,
    ) {
    }

    public function listRequests(array $filters): LengthAwarePaginator
    {
        $query = VerificationRequest::with([
            'breederProfile.user',
            'documents',
        ])->latest();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate(20);
    }

    public function review(VerificationRequest $vr, User $admin, string $status, ?string $notes): VerificationRequest
    {
        DB::transaction(function () use ($vr, $admin, $status, $notes) {
            $vr->update([
                'status'      => $status,
                'admin_notes' => $notes,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
            ]);

            if ($status === 'approved') {
                $vr->breederProfile->update(['verified_at' => now()]);
            }
        });

        // Audit log is outside transaction — audit log failure should not roll back the decision
        app(AdminAuditService::class)->log(
            $admin,
            "verification.{$status}",
            'VerificationRequest',
            $vr->id,
            ['notes_length' => strlen($notes ?? '')]
        );

        // Notification is outside transaction — mirrors audit log rationale in Story 3.2 §1
        match ($status) {
            'under_review' => $this->notificationService->notifyBreederUnderReview($vr),
            'approved'     => $this->notificationService->notifyBreederApproved($vr),
            'rejected'     => $this->notificationService->notifyBreederRejected($vr),
            default        => null,
        };

        return $vr->fresh(['breederProfile', 'documents']);
    }

    public function getDocumentPresignedUrl(BreederDocument $doc): string
    {
        // 15-minute TTL (900 seconds)
        return $this->s3Service->presignedUrl($doc->s3_key, 900);
    }
}
