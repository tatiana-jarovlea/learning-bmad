<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BreedController;
use App\Http\Controllers\Api\V1\BreederProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/v1/health', fn () => response()->json(['status' => 'ok']));

Route::prefix('v1')->group(function () {
    // Public auth routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::middleware('throttle:10,1')->post('/auth/login', [AuthController::class, 'login']);

    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',      [AuthController::class, 'me']);
    });

    // Public breeder/breed routes
    Route::get('/breeders/{id}', [BreederProfileController::class, 'show']);
    Route::get('/breeds',        [BreedController::class, 'index']);

    // Authenticated breeder routes
    Route::middleware(['auth:sanctum', 'role:breeder'])->group(function () {
        Route::post('/breeder/profile',       [BreederProfileController::class, 'store']);
        Route::put('/breeder/profile',        [BreederProfileController::class, 'update']);
        Route::get('/breeder/profile',        [BreederProfileController::class, 'myProfile']);
        Route::post('/breeder/profile/photo', [BreederProfileController::class, 'uploadPhoto']);
    });
});
