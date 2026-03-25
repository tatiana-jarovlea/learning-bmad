<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_request_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verification_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('breeder_document_id')->constrained('breeder_documents')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_request_documents');
    }
};
