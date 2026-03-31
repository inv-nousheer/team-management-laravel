<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
   public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

       $credentials = $request->only('email', 'password');

         if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // $token = $user->createToken($request->role ?? 'user')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => auth()->user()
        ]);
    }
}
