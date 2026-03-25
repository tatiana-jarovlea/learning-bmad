<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:breeder middleware handles authorization
    }

    public function rules(): array
    {
        return [
            'document_ids'   => ['required', 'array', 'min:1'],
            'document_ids.*' => ['integer', 'exists:breeder_documents,id'],
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function ($validator) {
            $user    = $this->user();
            $profile = $user->breederProfile;

            if (!$profile) {
                $validator->errors()->add('profile', 'You must create a breeder profile before submitting verification.');
                return;
            }

            $validIds = $profile->documents()
                ->whereIn('id', $this->document_ids ?? [])
                ->whereNull('deleted_at')
                ->pluck('id');

            $invalidCount = count($this->document_ids ?? []) - $validIds->count();

            if ($invalidCount > 0) {
                $validator->errors()->add('document_ids', 'One or more documents are invalid or do not belong to your profile.');
            }
        });
    }
}
