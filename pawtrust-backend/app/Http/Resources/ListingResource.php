<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'description'    => $this->description,
            'species'        => $this->species,
            'breed'          => $this->breed,
            'gender'         => $this->gender,
            'date_of_birth'  => $this->date_of_birth?->toDateString(),
            'price'          => $this->price,
            'currency'       => $this->currency,
            'location'       => $this->location ?? $this->breederProfile?->location,
            'status'         => $this->status,
            'listing_type'   => $this->listing_type,
            'featured_until' => $this->featured_until,
            'photos'         => ListingPhotoResource::collection($this->whenLoaded('photos')),
            // SECURITY: health_certificate_key NEVER included — access controlled post-inquiry
            'health_certificate' => $this->health_certificate_key ? 'on_file' : null,
            'breeder'        => BreederProfilePublicResource::make($this->whenLoaded('breederProfile')),
            'created_at'     => $this->created_at,
        ];
    }
}
