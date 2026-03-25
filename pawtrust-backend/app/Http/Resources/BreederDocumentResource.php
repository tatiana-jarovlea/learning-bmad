<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BreederDocumentResource extends JsonResource
{
    // SECURITY: s3_key NEVER included — access via /url endpoint, admin-only.
    // Filenames are shown for UX, but S3 paths must never be exposed.

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'document_type' => $this->document_type,
            'filename'      => $this->original_filename,
            'uploaded_at'   => $this->created_at,
            'status'        => $this->status,
        ];
    }
}
