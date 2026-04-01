<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:send-weekly-report')
    ->cron('0 9 * * 1');

Schedule::command('app:send-monthly-report')
    ->monthlyOn(1, '9:00');

Schedule::command('app:send-daily-report')
    ->dailyAt('9:00');

schedule::command('app:check-expected-ending-time')
    ->everyMinute();
