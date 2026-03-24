<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BreederProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kennel_name'            => ['nullable', 'string', 'max:255'],
            'display_name'           => ['nullable', 'string', 'max:255'],
            'description'            => ['nullable', 'string', 'max:1000'],
            'location'               => ['nullable', 'string', 'max:255'],
            'phone'                  => ['nullable', 'string', 'max:50'],
            'website'                => ['nullable', 'url', 'max:255'],
            'breed_specialization'   => ['nullable', 'array'],
            'breed_specialization.*' => ['string', 'max:100'],
            'years_active'           => ['nullable', 'integer', 'min:0', 'max:100'],
            'profile_photo'          => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
