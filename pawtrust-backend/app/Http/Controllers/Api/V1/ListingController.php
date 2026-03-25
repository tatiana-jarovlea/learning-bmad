<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateListingRequest;
use App\Http\Requests\ListingSearchRequest;
use App\Http\Resources\ListingCardResource;
use App\Http\Resources\ListingResource;
use App\Http\Resources\ListingSummaryResource;
use App\Models\Listing;
use App\Models\Review;
use App\Services\ListingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ListingController extends Controller
{
    public function __construct(private readonly ListingService $listingService) {}

    public function index(ListingSearchRequest $request): JsonResponse
    {
        $paginator = $this->listingService->search($request->validated());

        return response()->json([
            'data' => ListingCardResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function store(CreateListingRequest $request): JsonResponse
    {
        $listing = $this->listingService->create($request->user(), $request->validated());

        return response()->json(['data' => new ListingResource($listing->load(['photos', 'breederProfile']))], 201);
    }

    public function show(int $id): JsonResponse
    {
        $listing = Listing::with([
            'photos',
            'breederProfile',
            'breederProfile.achievements' => fn ($q) => $q->latest()->limit(3),
            'reviews'                     => fn ($q) => $q->published()->with('buyer')->latest()->limit(5),
        ])
        ->where('status', 'active')
        ->findOrFail($id);

        $reviewSummary = Review::where('listing_id', $listing->id)
            ->published()
            ->selectRaw('AVG(rating) as average, COUNT(*) as total')
            ->first();

        return response()->json([
            'data' => ListingResource::make($listing)
                ->additional([
                    'review_summary' => [
                        'average_rating' => $reviewSummary?->average ? round((float) $reviewSummary->average, 1) : null,
                        'total_count'    => (int) ($reviewSummary?->total ?? 0),
                    ],
                ]),
        ]);
    }

    public function update(Request $request, Listing $listing): JsonResponse
    {
        $this->authorizeOwner($request, $listing);

        $data = $request->validate([
            'title'         => ['sometimes', 'string', 'max:255'],
            'description'   => ['sometimes', 'string', 'max:500'],
            'species'       => ['sometimes', 'in:dog,cat,other'],
            'breed'         => ['sometimes', 'string', 'max:255'],
            'gender'        => ['sometimes', 'in:male,female'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'price'         => ['sometimes', 'numeric', 'min:0', 'max:999999'],
            'currency'      => ['nullable', 'in:EUR,MDL,RON'],
            'location'      => ['nullable', 'string', 'max:255'],
            'listing_type'  => ['nullable', 'in:standard,featured'],
        ]);

        $listing = $this->listingService->update($listing, $data);

        return response()->json(['data' => new ListingResource($listing->load(['photos', 'breederProfile']))]);
    }

    public function destroy(Request $request, Listing $listing): JsonResponse
    {
        $this->authorizeOwner($request, $listing);

        $this->listingService->softDelete($listing);

        return response()->json(null, 204);
    }

    public function myListings(Request $request): AnonymousResourceCollection
    {
        $profile = $request->user()->breederProfile;

        if (!$profile) {
            return ListingSummaryResource::collection(collect());
        }

        $listings = $profile->listings()->with(['photos' => fn ($q) => $q->where('sort_order', 0)])->get();

        return ListingSummaryResource::collection($listings);
    }

    private function authorizeOwner(Request $request, Listing $listing): void
    {
        $listing->load('breederProfile');

        if ($listing->breederProfile?->user_id !== $request->user()->id) {
            abort(403, 'Forbidden');
        }
    }
}
