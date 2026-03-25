<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Services\ListingPhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HealthCertificateController extends Controller
{
    public function __construct(private readonly ListingPhotoService $photoService) {}

    public function store(Request $request, Listing $listing): JsonResponse
    {
        $listing->load('breederProfile');

        if ($listing->breederProfile?->user_id !== $request->user()->id) {
            abort(403, 'Forbidden');
        }

        $request->validate([
            'certificate' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,webp'],
        ]);

        $file = $request->file('certificate');

        $this->photoService->validateFileMagicBytes($file, ['pdf', 'image']);

        $ext = $file->guessExtension() ?? 'pdf';
        $key = "health-certificates/{$listing->id}/" . Str::uuid() . ".{$ext}";

        Storage::disk('s3')->put($key, file_get_contents($file->getRealPath()), 'private');

        $listing->update(['health_certificate_key' => $key]);

        return response()->json(['data' => ['health_certificate' => 'on_file']]);
    }
}
