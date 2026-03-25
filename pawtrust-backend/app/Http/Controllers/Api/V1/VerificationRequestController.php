<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitVerificationRequest;
use App\Http\Resources\VerificationRequestResource;
use App\Services\VerificationRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationRequestController extends Controller
{
    public function __construct(private VerificationRequestService $service) {}

    public function store(SubmitVerificationRequest $request): JsonResponse
    {
        try {
            $vr = $this->service->submit(
                $request->user(),
                $request->validated()['document_ids']
            );
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(
            ['data' => VerificationRequestResource::make($vr->load('documents'))],
            201
        );
    }

    public function status(Request $request): JsonResponse
    {
        $profile = $request->user()->breederProfile;

        if (!$profile) {
            return response()->json(['data' => [
                'status'       => 'not_submitted',
                'admin_notes'  => null,
                'submitted_at' => null,
                'reviewed_at'  => null,
            ]]);
        }

        $statusKey = $this->service->getStatusForBreeder($profile);
        $latest    = $this->service->getLatestForBreeder($profile);

        return response()->json(['data' => [
            'status'       => $statusKey,
            'admin_notes'  => ($latest && $latest->status === 'rejected') ? $latest->admin_notes : null,
            'submitted_at' => $latest?->created_at,
            'reviewed_at'  => $latest?->reviewed_at,
        ]]);
    }
}
