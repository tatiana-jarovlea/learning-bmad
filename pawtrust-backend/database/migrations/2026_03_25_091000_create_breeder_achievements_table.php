<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('breeder_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('breeder_profile_id')->constrained()->cascadeOnDelete();
            $table->string('title', 255);
            $table->string('federation', 100);
            $table->smallInteger('year');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breeder_achievements');
    }
};
