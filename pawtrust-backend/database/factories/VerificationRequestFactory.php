<?php

namespace Database\Factories;

use App\Models\BreederProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class VerificationRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'breeder_profile_id' => BreederProfile::factory(),
            'status'             => 'pending',
            'admin_notes'        => null,
            'reviewed_at'        => null,
            'reviewed_by'        => null,
        ];
    }
}
