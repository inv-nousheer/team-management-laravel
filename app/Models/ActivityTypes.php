<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ActivityTypes extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'activity_types';

    protected $fillable = [
        'name',
        'color',
        'icon',
        'priority',
        'emailTemplate',
        'subjectTemplate'
    ];
}
