<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingPhotoResource;
use App\Models\Listing;
use App\Models\ListingPhoto;
use App\Services\ListingPhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingPhotoController extends Controller
{
    public function __construct(private readonly ListingPhotoService $photoService) {}

    public function store(Request $request, Listing $listing): JsonResponse
    {
        $this->authorizeOwner($request, $listing);

        $request->validate([
            'photo'      => ['required', 'file', 'max:5120'],
            'photo_type' => ['nullable', 'in:listing,parent'],
        ]);

        $photo = $this->photoService->upload(
            $listing,
            $request->file('photo'),
            $request->input('photo_type', 'listing')
        );

        return response()->json(['data' => new ListingPhotoResource($photo)], 201);
    }

    public function destroy(Request $request, Listing $listing, ListingPhoto $photo): JsonResponse
    {
        $this->authorizeOwner($request, $listing);

        if ($photo->listing_id !== $listing->id) {
            abort(404);
        }

        $this->photoService->delete($photo);

        return response()->json(null, 204);
    }

    private function authorizeOwner(Request $request, Listing $listing): void
    {
        $listing->load('breederProfile');

        if ($listing->breederProfile?->user_id !== $request->user()->id) {
            abort(403, 'Forbidden');
        }
    }
}
