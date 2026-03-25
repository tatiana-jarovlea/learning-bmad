<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminAuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = ['admin_user_id', 'action', 'target_type', 'target_id', 'metadata'];

    protected $casts = ['metadata' => 'array'];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}
