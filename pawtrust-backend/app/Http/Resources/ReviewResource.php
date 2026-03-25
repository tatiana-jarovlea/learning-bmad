<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'rating'     => $this->rating,
            'comment'    => $this->comment,
            'buyer_name' => $this->whenLoaded('buyer', fn () => $this->buyer->name, 'Anonymous'),
            'created_at' => $this->created_at,
        ];
    }
}
