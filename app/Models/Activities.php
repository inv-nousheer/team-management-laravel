<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Activities extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'activities';

    protected $fillable = [
        'member_id',
        'activity_type_id',
        'date',
        'status',
        'member_name',
        'description',
        'duration',
        'blocker',
        'expected_ending_time',
        'mail_sent'
    ];
     
}
