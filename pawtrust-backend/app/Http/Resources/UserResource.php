<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'email'            => $this->email,
            'role'             => $this->role,
            'locale'           => $this->locale,
            'profile_complete' => $this->when(
                $this->role === 'breeder',
                fn () => $this->breederProfile?->isProfileComplete() ?? false
            ),
        ];
    }
}
