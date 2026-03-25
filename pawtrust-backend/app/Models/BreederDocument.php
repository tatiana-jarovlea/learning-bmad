<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BreederDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'breeder_profile_id', 'document_type', 'original_filename',
        's3_key', 'status', 'reviewed_at', 'reviewed_by',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function breederProfile(): BelongsTo
    {
        return $this->belongsTo(BreederProfile::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
