<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreederProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'kennel_name', 'display_name', 'description',
        'location', 'phone', 'website', 'breed_specialization',
        'profile_photo_key', 'years_active', 'verified_at', 'verified_by',
    ];

    protected $casts = [
        'breed_specialization' => 'array',
        'verified_at'          => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function isProfileComplete(): bool
    {
        return filled($this->kennel_name)
            && filled($this->description)
            && filled($this->location);
    }
}
