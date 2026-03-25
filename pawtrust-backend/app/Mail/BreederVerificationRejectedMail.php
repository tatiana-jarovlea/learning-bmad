<?php

namespace App\Mail;

use App\Models\BreederProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BreederVerificationRejectedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $kennel_name;
    public string $admin_notes;
    public string $dashboardUrl;

    public function __construct(BreederProfile $profile, string $admin_notes)
    {
        $this->kennel_name  = $profile->kennel_name ?? $profile->user->name;
        $this->admin_notes  = $admin_notes;
        $this->dashboardUrl = config('app.frontend_url', config('app.url')) . '/breeder/verification';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('mail.verification.rejected.subject', [], $this->locale ?? config('app.locale')),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.breeder-rejected',
        );
    }
}
