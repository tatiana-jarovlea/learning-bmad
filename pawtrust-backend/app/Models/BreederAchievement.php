<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreederAchievement extends Model
{
    use HasFactory;

    protected $fillable = ['breeder_profile_id', 'title', 'federation', 'year'];

    public function breederProfile(): BelongsTo
    {
        return $this->belongsTo(BreederProfile::class);
    }
}
