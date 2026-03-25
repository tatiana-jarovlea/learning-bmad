<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewVerificationRequest;
use App\Http\Resources\Admin\AdminVerificationRequestResource;
use App\Models\BreederDocument;
use App\Models\VerificationRequest;
use App\Services\AdminVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminVerificationController extends Controller
{
    public function __construct(private readonly AdminVerificationService $service)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $paginator = $this->service->listRequests($request->only('status'));

        return AdminVerificationRequestResource::collection($paginator);
    }

    public function review(
        ReviewVerificationRequest $request,
        VerificationRequest $verificationRequest
    ): JsonResponse {
        $updated = $this->service->review(
            $verificationRequest,
            $request->user(),
            $request->validated('status'),
            $request->validated('notes'),
        );

        return response()->json([
            'data' => new AdminVerificationRequestResource($updated),
        ]);
    }

    public function documentPreview(BreederDocument $document): JsonResponse
    {
        $url       = $this->service->getDocumentPresignedUrl($document);
        $expiresAt = now()->addSeconds(900)->toIso8601String();

        return response()->json([
            'data' => [
                'url'        => $url,
                'expires_at' => $expiresAt,
            ],
        ]);
    }
}
