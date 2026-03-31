<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        Member::insert([
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'role' => 'Developer',
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'role' => 'Designer',
                'color' => '#ec4899',
            ],
            [
                'name' => 'Rahul',
                'email' => 'rahul@example.com',
                'role' => 'Tester',
                'color' => '#22c55e',
            ],
        ]);
    }
}
