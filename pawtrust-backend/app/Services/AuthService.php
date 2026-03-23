<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'role'     => $data['role'],
            'locale'   => 'ro',
        ]);

        // Ensure role exists before assigning (idempotent for tests and fresh installs)
        Role::firstOrCreate(['name' => $data['role'], 'guard_name' => 'web']);

        $user->assignRole($data['role']);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['token' => $token, 'user' => $user];
    }
}
