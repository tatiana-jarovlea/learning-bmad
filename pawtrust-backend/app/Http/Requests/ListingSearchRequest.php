<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListingSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q'               => ['nullable', 'string', 'max:200'],
            'species'         => ['nullable', 'in:dog,cat,other'],
            'breed'           => ['nullable', 'string', 'max:255'],
            'location_city'   => ['nullable', 'string', 'max:100'],
            'location_region' => ['nullable', 'string', 'max:100'],
            'price_min'       => ['nullable', 'numeric', 'min:0'],
            'price_max'       => ['nullable', 'numeric', 'min:0',
                Rule::when(
                    fn ($input) => filled($input->price_min),
                    ['gt:price_min']
                ),
            ],
            'verified_only'   => ['nullable', 'boolean'],
            'page'            => ['nullable', 'integer', 'min:1'],
            'per_page'        => ['nullable', 'integer', 'in:10,20,50'],
        ];
    }
}
