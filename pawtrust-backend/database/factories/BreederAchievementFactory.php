<?php

namespace Database\Factories;

use App\Models\BreederProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class BreederAchievementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'breeder_profile_id' => BreederProfile::factory(),
            'title'              => $this->faker->sentence(3, true),
            'federation'         => $this->faker->randomElement(['FCI', 'AChR', 'UKC', 'AKC']),
            'year'               => $this->faker->numberBetween(2010, 2025),
        ];
    }
}
