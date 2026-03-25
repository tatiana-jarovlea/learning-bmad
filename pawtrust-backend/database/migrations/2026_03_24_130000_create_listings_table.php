<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('breeder_profile_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->enum('species', ['dog', 'cat', 'other']);
            $table->string('breed', 255);
            $table->enum('gender', ['male', 'female']);
            $table->date('date_of_birth')->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('currency', ['EUR', 'MDL', 'RON'])->default('EUR');
            $table->string('location')->nullable();
            $table->enum('status', ['draft', 'active', 'sold', 'expired'])->default('draft');
            $table->enum('listing_type', ['standard', 'featured'])->default('standard');
            $table->timestamp('featured_until')->nullable();
            $table->string('health_certificate_key')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
