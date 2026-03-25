<?php

namespace App\Http\Resources;

use App\Services\S3Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BreederSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'kennel_name'          => $this->kennel_name,
            'display_name'         => $this->display_name,
            'location'             => $this->location,
            'verified'             => $this->isVerified(),
            'verified_at'          => $this->verified_at,
            'breed_specialization' => $this->breed_specialization,
            'profile_photo_url'    => $this->profile_photo_key
                ? app(S3Service::class)->presignedUrl($this->profile_photo_key, 3600)
                : null,
            'achievements_count'   => $this->whenLoaded(
                'achievements',
                fn () => $this->achievements->count(),
                0
            ),
            // SECURITY: NO phone, email — contact gated by inquiry
        ];
    }
}
