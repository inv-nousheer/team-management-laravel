<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActivityController;
use Illuminate\Http\Request;


Route::post('/login', [AuthController::class, 'login'])->name('login');


// Route::middleware('auth:api')->group(function () {
    Route::get('/activity-types', [ActivityController::class, 'index']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
    Route::get('/members', [ActivityController::class, 'members']);
    Route::post('/members', [ActivityController::class, 'addMember']);
    Route::put('/members/{id}', [ActivityController::class, 'updateMember']);
    Route::put('/activity-types/{id}', [ActivityController::class, 'updateActivityType']);

    Route::post('/activity-types', [ActivityController::class, 'addType']);
    Route::get('/activities', [ActivityController::class, 'getActivitiesByMonthYear']);
// });
