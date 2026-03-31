<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityTypes;

class ActivityTypeSeeder extends Seeder
{
    public function run(): void
    {
        ActivityTypes::insert([
            [
                'name' => 'Development',
                'color' => '#3b82f6',
                'icon' => 'code',
                'priority' => 1,
            ],
            [
                'name' => 'Meeting',
                'color' => '#f59e0b',
                'icon' => 'users',
                'priority' => 2,
            ],
            [
                'name' => 'Testing',
                'color' => '#22c55e',
                'icon' => 'check',
                'priority' => 3,
            ],
        ]);
    }
}
