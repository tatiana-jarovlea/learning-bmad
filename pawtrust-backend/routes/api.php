<?php

use App\Http\Controllers\Api\V1\AuthController;
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
});
