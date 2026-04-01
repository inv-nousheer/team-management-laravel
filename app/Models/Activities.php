<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Activities extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'activities';
    protected $casts = [
        'expected_ending_time' => 'datetime',
        'date' => 'datetime',
    ];

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
     public function member()
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function activityType()
    {
        return $this->belongsTo(ActivityTypes::class, 'activity_type_id');
    }

}
