<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('breeder_profile_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected'])
                  ->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'created_at'], 'idx_verification_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_requests');
    }
};
