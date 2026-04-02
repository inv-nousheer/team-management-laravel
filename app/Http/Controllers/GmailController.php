<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\GmailServices;

class GmailController extends Controller
{
    public function redirect(GmailServices $gmail)
    {
        return redirect($gmail->getAuthUrl());
    }

    public function callback(Request $request, GmailServices $gmail)
    {
        $gmail->handleCallback($request->code);
        return redirect('/gmail/emails');
    }

    public function emails(GmailServices $gmail)
    {
        // pass your label name here
        $emails = $gmail->getEmailsByLabel('YourLabelName');
        return response()->json($emails);
    }
}
