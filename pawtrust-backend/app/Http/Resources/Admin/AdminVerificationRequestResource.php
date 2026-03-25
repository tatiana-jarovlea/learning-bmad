<?php

/**
 * ADMIN-ONLY RESOURCE.
 *
 * This resource includes sensitive fields (e.g. breeder email) intended exclusively
 * for admin use. It MUST NOT be used in any public or breeder-facing endpoint.
 * It is only safe behind `role:admin` middleware.
 */

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminVerificationRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status,
            'admin_notes'  => $this->admin_notes,
            'submitted_at' => $this->created_at,
            'reviewed_at'  => $this->reviewed_at,
            'reviewed_by'  => $this->reviewed_by,
            'breeder'      => [
                'id'          => $this->breederProfile->id,
                'name'        => $this->breederProfile->user->name,
                'kennel_name' => $this->breederProfile->kennel_name,
                'email'       => $this->breederProfile->user->email,
            ],
            'documents' => $this->whenLoaded('documents', fn () =>
                $this->documents->map(fn ($doc) => [
                    'id'            => $doc->id,
                    'document_type' => $doc->document_type,
                    'filename'      => $doc->original_filename,
                    'status'        => $doc->status,
                ])
            ),
        ];
    }
}
