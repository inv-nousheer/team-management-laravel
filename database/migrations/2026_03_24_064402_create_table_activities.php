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
        // Schema::create('activities', function (Blueprint $table) {
        //     $table->id();
        //     $table->unsignedBigInteger('member_id');
        //     $table->unsignedBigInteger('activity_type_id');
        //     $table->text('description')->nullable();
        //     $table->dateTime('date');
        //     $table->integer('duration')->nullable()->comments('Duration in minutes');
        //     $table->tinyInteger('status')->default(0)->comments('1 = pending, 2 = completed'); // 1 = pending, 2 = completed
        //     $table->tinyInteger('blockers')->default(0)->comments('0 = no blockers, 1 = has blockers'); // 0 = no blockers, 1 = has blockers
        //     $table->dateTime('expected_ending_time')->nullable();
        //     $table->tinyInteger('mail_sent')->default(0)->comments('0 = not sent, 1 = sent'); // 0 = not sent, 1 = sent
        //     $table->timestamps();
        // });
         Schema::connection('mongodb')->create('activities', function ($collection) {

            // Referencing fields
            $collection->index('member_id');
            $collection->index('activity_type_id');

            // Useful indexes for filtering
            $collection->index('date');
            $collection->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('activities');
    }
};
