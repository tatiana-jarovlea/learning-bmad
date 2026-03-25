<?php

namespace App\Mail;

use App\Models\BreederProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BreederVerificationUnderReviewMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $kennel_name;
    public string $dashboardUrl;

    public function __construct(BreederProfile $profile)
    {
        $this->kennel_name  = $profile->kennel_name ?? $profile->user->name;
        $this->dashboardUrl = config('app.frontend_url', config('app.url')) . '/breeder';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('mail.verification.under_review.subject', [], $this->locale ?? config('app.locale')),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.breeder-under-review',
        );
    }
}
