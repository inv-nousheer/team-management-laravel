<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'notifications';
    protected $fillable = [
        'message',
        'type',
        'read',
        'user_id'
    ];
}
