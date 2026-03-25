<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->index(['status', 'species'], 'idx_listings_status_species');
            $table->index(['breeder_profile_id', 'status'], 'idx_listings_breeder_status');
            $table->index(['featured_until', 'status'], 'idx_listings_featured');
        });

        DB::statement('ALTER TABLE listings ADD FULLTEXT INDEX idx_listings_search (title, description, breed)');
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropIndex('idx_listings_status_species');
            $table->dropIndex('idx_listings_breeder_status');
            $table->dropIndex('idx_listings_featured');
        });

        DB::statement('ALTER TABLE listings DROP INDEX idx_listings_search');
    }
};
