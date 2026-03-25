<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InquiryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'listing_id' => Listing::factory(),
            'buyer_id'   => User::factory(),
            'message'    => $this->faker->optional()->sentence(),
            'status'     => 'contact_revealed',
        ];
    }
}
