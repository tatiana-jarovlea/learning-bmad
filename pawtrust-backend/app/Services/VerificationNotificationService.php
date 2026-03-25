<?php

namespace App\Services;

use App\Mail\AdminNewVerificationRequestMail;
use App\Mail\BreederVerificationApprovedMail;
use App\Mail\BreederVerificationRejectedMail;
use App\Mail\BreederVerificationUnderReviewMail;
use App\Models\VerificationRequest;
use Illuminate\Support\Facades\Mail;

class VerificationNotificationService
{
    public function notifyAdminNewRequest(VerificationRequest $vr): void
    {
        Mail::to(config('app.admin_notification_email'))
            ->queue(new AdminNewVerificationRequestMail($vr->breederProfile));
    }

    public function notifyBreederUnderReview(VerificationRequest $vr): void
    {
        $user = $vr->breederProfile->user;
        Mail::to($user->email)
            ->locale($user->locale)
            ->queue(new BreederVerificationUnderReviewMail($vr->breederProfile));
    }

    public function notifyBreederApproved(VerificationRequest $vr): void
    {
        $user = $vr->breederProfile->user;
        Mail::to($user->email)
            ->locale($user->locale)
            ->queue(new BreederVerificationApprovedMail($vr->breederProfile));
    }

    public function notifyBreederRejected(VerificationRequest $vr): void
    {
        $user = $vr->breederProfile->user;
        Mail::to($user->email)
            ->locale($user->locale)
            ->queue(new BreederVerificationRejectedMail($vr->breederProfile, $vr->admin_notes ?? ''));
    }
}
