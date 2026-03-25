<?php

namespace App\Services;

use App\Models\BreederProfile;
use App\Models\User;
use App\Models\VerificationRequest;

class VerificationRequestService
{
    public function submit(User $user, array $documentIds): VerificationRequest
    {
        $profile = $user->breederProfile;

        $active = $profile->verificationRequests()
            ->whereIn('status', ['pending', 'under_review'])
            ->first();

        if ($active) {
            throw new \DomainException(
                'A verification request is already ' . $active->status . '. Please wait for a decision.'
            );
        }

        $request = VerificationRequest::create([
            'breeder_profile_id' => $profile->id,
            'status'             => 'pending',
        ]);

        $request->documents()->sync($documentIds);

        return $request;
    }

    public function getLatestForBreeder(BreederProfile $profile): ?VerificationRequest
    {
        return $profile->verificationRequests()->latest()->first();
    }

    public function getStatusForBreeder(BreederProfile $profile): string
    {
        if ($profile->verified_at) {
            return 'verified';
        }

        $latest = $profile->verificationRequests()->latest()->first();

        if (!$latest)                           return 'not_submitted';
        if ($latest->status === 'pending')      return 'pending';
        if ($latest->status === 'under_review') return 'under_review';
        if ($latest->status === 'rejected')     return 'rejected';

        return 'not_submitted';
    }
}
