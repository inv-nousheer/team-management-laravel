<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\GmailController;
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
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::post('/activity-types', [ActivityController::class, 'addType']);
    Route::get('/activities', [ActivityController::class, 'getActivitiesByMonthYear']);
    Route::get('/notifications/unread', function () {
        return \App\Models\Notification::where('read', false)
            ->where('user_id', auth()->id())
            ->get();
    });
    Route::post('/notifications/mark-read', function (Request $request) {
        \App\Models\Notification::whereIn('_id', $request->ids)
            ->update(['read' => true]);

        return response()->json(['success' => true]);
    });
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
// });
Route::get('/gmail/auth',     [GmailController::class, 'redirect']);
Route::get('/gmail/callback', [GmailController::class, 'callback']);
Route::get('/gmail/emails',   [GmailController::class, 'emails']);
