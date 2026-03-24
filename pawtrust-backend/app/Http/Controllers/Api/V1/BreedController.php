<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Breed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BreedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Breed::query();

        if ($request->filled('species')) {
            $query->where('species', $request->input('species'));
        }

        return response()->json(['data' => $query->orderBy('name_ro')->get()]);
    }
}
