<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Member extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'members';

    protected $fillable = [
        'name',
        'email',
        'role',
        'color'
    ];
}
