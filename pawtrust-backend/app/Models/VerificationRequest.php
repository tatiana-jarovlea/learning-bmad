<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class VerificationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'breeder_profile_id', 'status', 'admin_notes', 'reviewed_at', 'reviewed_by',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function breederProfile(): BelongsTo
    {
        return $this->belongsTo(BreederProfile::class);
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(
            BreederDocument::class,
            'verification_request_documents',
            'verification_request_id',
            'breeder_document_id'
        );
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'under_review']);
    }
}
