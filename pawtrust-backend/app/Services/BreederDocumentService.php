<?php

namespace App\Services;

use App\Models\BreederDocument;
use App\Models\BreederProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BreederDocumentService
{
    private const ALLOWED_SIGNATURES = [
        'pdf'  => '%PDF',
        'jpg'  => "\xFF\xD8\xFF",
        'png'  => "\x89PNG",
        'webp' => 'RIFF',
    ];

    public function upload(
        BreederProfile $profile,
        UploadedFile $file,
        string $documentType
    ): BreederDocument {
        $this->validateDocumentFile($file);

        $ext = $file->guessExtension() ?? 'bin';
        $key = "breeder-documents/{$profile->id}/" . Str::uuid() . ".{$ext}";

        Storage::disk('s3')->put($key, file_get_contents($file->getRealPath()), 'private');

        return $profile->documents()->create([
            'document_type'     => $documentType,
            'original_filename' => $file->getClientOriginalName(),
            's3_key'            => $key,
            'status'            => 'pending',
        ]);
    }

    public function softDelete(BreederDocument $document): void
    {
        // SECURITY: Does NOT delete from S3 — 30-day audit retention window.
        // A future PurgeDeletedDocumentsJob will handle physical S3 deletion.
        $document->delete();
    }

    public function getPresignedUrl(BreederDocument $document): string
    {
        return app(S3Service::class)->presignedUrl($document->s3_key, 900);
    }

    public function validateDocumentFile(UploadedFile $file): void
    {
        $handle = fopen($file->getRealPath(), 'rb');
        $header = fread($handle, 12);
        fclose($handle);

        $isJpeg = str_starts_with($header, self::ALLOWED_SIGNATURES['jpg']);
        $isPng  = str_starts_with($header, self::ALLOWED_SIGNATURES['png']);
        $isWebp = str_starts_with($header, 'RIFF') && substr($header, 8, 4) === 'WEBP';
        $isPdf  = str_starts_with($header, self::ALLOWED_SIGNATURES['pdf']);

        if (!$isJpeg && !$isPng && !$isWebp && !$isPdf) {
            throw ValidationException::withMessages([
                'file' => 'File must be a valid PDF, JPEG, PNG, or WebP.',
            ]);
        }
    }
}
