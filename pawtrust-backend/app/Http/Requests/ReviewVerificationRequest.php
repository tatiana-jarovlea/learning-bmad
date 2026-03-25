<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:under_review,approved,rejected'],
            'notes'  => ['required_if:status,rejected', 'nullable', 'string', 'min:20', 'max:1000'],
        ];
    }
}
