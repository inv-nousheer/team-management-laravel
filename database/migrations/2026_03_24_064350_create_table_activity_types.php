<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Schema::create('activity_types', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('name');
        //     $table->string('color')->nullable();
        //     $table->string('icon')->nullable();
        //     $table->tinyInteger('priority')->default(1);
        //     $table->string('email_subject')->nullable();
        //     $table->text('email_content')->nullable();
        //     $table->timestamps();
        //     });
        // }
         Schema::connection('mongodb')->create('activity_types', function ($collection) {
            $collection->index('name');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('activity_types');

    }
};
