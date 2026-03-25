<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VerificationRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status,
            'admin_notes'  => $this->when(
                                  $this->status === 'rejected',
                                  $this->admin_notes
                              ),
            'submitted_at' => $this->created_at,
            'reviewed_at'  => $this->reviewed_at,
            'documents'    => BreederDocumentResource::collection($this->whenLoaded('documents')),
        ];
    }
}
