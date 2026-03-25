<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('rating');
            $table->text('comment')->nullable();
            $table->enum('status', ['published', 'hidden'])->default('published');
            $table->timestamps();
            $table->unique(['buyer_id', 'listing_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
