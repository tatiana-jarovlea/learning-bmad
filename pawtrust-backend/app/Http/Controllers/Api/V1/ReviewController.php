<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(int $listingId): JsonResponse
    {
        $paginator = Review::where('listing_id', $listingId)
            ->published()
            ->with('buyer')
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => ReviewResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }
}
