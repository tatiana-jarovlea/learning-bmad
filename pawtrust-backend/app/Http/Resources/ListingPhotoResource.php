<?php

namespace App\Http\Resources;

use App\Services\S3Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingPhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $s3Service = app(S3Service::class);

        return [
            'id'         => $this->id,
            'photo_type' => $this->photo_type,
            'sort_order' => $this->sort_order,
            'url'        => $s3Service->presignedUrl($this->s3_key, 86400),
        ];
    }
}
