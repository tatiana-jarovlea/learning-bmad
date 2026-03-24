<?php

namespace Database\Factories;

use App\Models\BreederProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BreederProfile>
 */
class BreederProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'              => \App\Models\User::factory(),
            'kennel_name'          => $this->faker->company(),
            'display_name'         => $this->faker->name(),
            'description'          => $this->faker->paragraph(),
            'location'             => 'Chișinău, Moldova',
            'phone'                => null,
            'website'              => null,
            'breed_specialization' => ['Golden Retriever'],
            'profile_photo_key'    => null,
            'years_active'         => $this->faker->numberBetween(1, 20),
            'verified_at'          => null,
            'verified_by'          => null,
        ];
    }
}
