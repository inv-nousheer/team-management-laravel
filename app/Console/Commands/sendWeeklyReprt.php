<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;

#[Signature('app:send-weekly-reprt')]
#[Description('Command description')]
class sendWeeklyReprt extends Command
   
{
    /**
     * Execute the console command.
     */
    protected $signature = 'app:send-weekly-reprt';

    public function handle()
    {
        $activities = \App\Models\Activities::where('created_at', '>=', now()->subWeek())->get();
        //create a table using thhe activitiesdata

        $report = "<table border='1' cellpadding='5' cellspacing='0'>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Blockers</th>
                        <th>Expected Ending Time</th>
                    </tr>";
        foreach ($activities as $activity) {
            $report .= "<tr>
                            <td>{$activity->member_name}</td>
                            <td>{$activity->description}</td>
                            <td>{$activity->activity_type_id}</td>
                            <td>{$activity->date}</td>
                            <td>{$activity->duration}</td>
                            <td>{$activity->status}</td>
                            <td>{$activity->blockers}</td>
                            <td>{$activity->expected_ending_time}</td>
                        </tr>";
        }
        $report .= "</table>";
        $message = "Hi, here is your weekly activity report:";

        $this->info($report);
        // Here you can implement the logic to send the report via email or any other method
      $pdf = Pdf::loadHTML($report);

        Mail::send([], [], function ($message) use ($pdf) {
            $message->to('nousheerev50@gmail.com')
                    ->subject('Weekly Report')
                    ->html('Hi, weekly report attached.', 'text/html')
                    ->attachData($pdf->output(), 'weekly_report.pdf');
        });
    }
}
