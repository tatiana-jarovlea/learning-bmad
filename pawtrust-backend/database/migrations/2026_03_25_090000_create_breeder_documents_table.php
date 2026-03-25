<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('breeder_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('breeder_profile_id')->constrained()->cascadeOnDelete();
            $table->string('document_type', 100);
            $table->string('original_filename', 255);
            $table->string('s3_key', 1024);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breeder_documents');
    }
};
