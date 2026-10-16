<?php

namespace App\Models;

use App\Enums\LicenseStatus;
use App\Enums\LicenseType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class License extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'license_key',
        'type',
        'status',
        'purchased_at',
        'expires_at',
        'updated_until',
        'seat_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => LicenseType::class,
            'status' => LicenseStatus::class,
            'purchased_at' => 'datetime',
            'expires_at' => 'datetime',
            'updated_until' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function isActive(): bool
    {
        return $this->status === LicenseStatus::Active;
    }

    public function isTrial(): bool
    {
        return $this->type === LicenseType::Trial;
    }

    public function isExpired(): bool
    {
        if ($this->isTrial()) {
            return $this->expires_at && $this->expires_at->isPast();
        }

        return $this->expires_at && $this->expires_at->isPast();
    }

    public function activeDeviceCount(): int
    {
        return $this->devices()->where('is_active', true)->count();
    }

    public function maxDevices(): int
    {
        return $this->seat_count * 2;
    }
}
