<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['required', 'string', 'max:500'],
            'species'       => ['required', 'in:dog,cat,other'],
            'breed'         => ['required', 'string', 'max:255'],
            'gender'        => ['required', 'in:male,female'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'price'         => ['required', 'numeric', 'min:0', 'max:999999'],
            'currency'      => ['nullable', 'in:EUR,MDL,RON'],
            'location'      => ['nullable', 'string', 'max:255'],
            'listing_type'  => ['nullable', 'in:standard,featured'],
        ];
    }
}
