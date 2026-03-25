<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'buyer_id'   => User::factory()->state(['role' => 'buyer']),
            'listing_id' => Listing::factory(),
            'rating'     => $this->faker->numberBetween(1, 5),
            'comment'    => $this->faker->optional()->paragraph(),
            'status'     => 'published',
        ];
    }
}
