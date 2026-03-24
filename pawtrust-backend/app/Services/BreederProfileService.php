<?php

namespace App\Services;

use App\Models\BreederProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BreederProfileService
{
    public function createProfile(User $user, array $data, ?UploadedFile $photo): BreederProfile
    {
        unset($data['profile_photo']);

        $profile = BreederProfile::create(array_merge($data, ['user_id' => $user->id]));

        if ($photo) {
            $this->storePhoto($profile, $user, $photo);
        }

        return $profile->fresh();
    }

    public function updateProfile(BreederProfile $profile, array $data, ?UploadedFile $photo): BreederProfile
    {
        unset($data['profile_photo']);

        $profile->update($data);

        if ($photo) {
            $this->storePhoto($profile, $profile->user, $photo);
        }

        return $profile->fresh();
    }

    public function uploadPhoto(BreederProfile $profile, User $user, UploadedFile $photo): BreederProfile
    {
        $this->storePhoto($profile, $user, $photo);
        return $profile->fresh();
    }

    public function getPublicProfile(int $id): BreederProfile
    {
        return BreederProfile::where('user_id', $id)->firstOrFail();
    }

    private function storePhoto(BreederProfile $profile, User $user, UploadedFile $photo): void
    {
        $key = "breeder-photos/{$user->id}/" . Str::uuid() . '.' . $photo->extension();
        Storage::disk('s3')->put($key, file_get_contents($photo->getRealPath()), 'private');

        if ($profile->profile_photo_key) {
            Storage::disk('s3')->delete($profile->profile_photo_key);
        }

        $profile->update(['profile_photo_key' => $key]);
    }
}
