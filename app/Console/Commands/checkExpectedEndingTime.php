<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\Activities;
use App\Models\Member;
use MongoDB\BSON\UTCDateTime;
use Carbon\Carbon;


#[Signature('app:check-expected-ending-time')]
#[Description('Command description')]
class checkExpectedEndingTime extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
       $now = now()->utc();
        $windowStart = $now->copy()->startOfMinute(); // e.g. 06:49:00
        $windowEnd   = $now->copy()->endOfMinute();   // e.g. 06:49:59

        $activities = \App\Models\Activities::with('member')
            ->whereBetween('expected_ending_time', [$windowStart, $windowEnd])
            ->where('status', '!=', 'completed')
            ->get();

        Log::info("current time", ['data' => $now]);
        Log::info("activity list", ['data' => $activities]);

        foreach ($activities as $activity) {
            Log::info("Activity {$activity->_id} reached expected ending time.");

            Mail::send([], [], function ($mail) use ($activity) {
                $mail->to('nousheerev50@gmail.com')
                    ->subject('Activity Expected Ending Time Alert')
                    ->html("Hi, the activity with ID {$activity->_id} {$activity->description} of member {$activity->member_name} reached its expected ending time.");
            });
            \App\Models\Notification::create([
                'message' => "Activity with ID {$activity->_id} {$activity->description} of member {$activity->member_name} reached its expected ending time",
                'type' => 'activity_alert',
                'read' => false,
                'user_id' => $activity->user_id
            ]);
        }
    }
}
