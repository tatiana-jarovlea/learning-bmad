<?php

namespace App\Mail;

use App\Models\BreederProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNewVerificationRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $breeder_name;
    public string $breeder_email;
    public string $kennel_name;
    public string $adminUrl;

    public function __construct(BreederProfile $profile)
    {
        $this->breeder_name  = $profile->user->name;
        $this->breeder_email = $profile->user->email;
        $this->kennel_name   = $profile->kennel_name ?? $profile->user->name;
        $this->adminUrl      = config('app.frontend_url', config('app.url')) . '/admin/verification';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('mail.verification.admin_new_request.subject', [
                'kennel_name' => $this->kennel_name,
            ]),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.admin-new-request',
        );
    }
}
