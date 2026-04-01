<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


#[Signature('app:send-daily-report')]
#[Description('Command description')]
class sendDailyReport extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $inactiveMembers = \App\Models\Member::whereDoesntHave('activities', function ($query) {
            $query->where('created_at', '>=', now()->subDay());
        })->get();
        $members = $inactiveMembers->pluck('name')->toArray();
        $emailContent = "Hi, the following members have not logged any activities for today:<br><br>"
            . implode(', ', $members);
        // Here you can implement the logic to send the message via email or any other method
        Mail::send([], [], function ($mail) use ($emailContent) {
            $mail->to('nousheerev50@gmail.com')
                    ->subject('Pending Activities')
                    ->html($emailContent, 'text/html');
        });
        $activeMembers = \App\Models\Member::withWhereHas('activities', function ($query) {
            $query->where('created_at', '>=', now()->subDay());
        })->get();
        Log::info("message", ['data' => $activeMembers]);
        $report = '<table border="1" cellpadding="5" cellspacing="0">
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Blockers</th>
                        <th>Expected Ending Time</th>
                    </tr>';
        foreach ($activeMembers as $member) {
            $report .= "<tr>
                            <td>{$member->name}</td>
                            <td>{$member->activities->description}</td>
                            <td>{$member->activities?->activity_type_id}</td>
                            <td>{$member->activities?->date}</td>
                            <td>{$member->activities?->duration}</td>
                            <td>{$member->activities?->status}</td>
                            <td>{$member->activities?->blockers}</td>
                            <td>{$member->activities?->expected_ending_time}</td>
                        </tr>";

        }
        $report .= '</table>';
        $this->info($report);
        Mail::send([], [], function ($mail) use ($report) {
            $mail->to('nousheerev50@gmail.com')
                    ->subject('Daily Report')
                    ->html($report, 'text/html');
        });
    }
}
