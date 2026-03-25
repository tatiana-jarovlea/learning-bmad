<?php

namespace Database\Factories;

use App\Models\BreederProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class BreederDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'breeder_profile_id' => BreederProfile::factory(),
            'document_type'      => $this->faker->randomElement([
                'kennel_cert', 'fci_papers', 'vaccination_records', 'health_tests', 'other',
            ]),
            'original_filename'  => $this->faker->word() . '.pdf',
            's3_key'             => 'breeder-documents/1/' . $this->faker->uuid() . '.pdf',
            'status'             => 'pending',
            'reviewed_at'        => null,
            'reviewed_by'        => null,
        ];
    }
}
