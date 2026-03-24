<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email    = config('app.admin_email');
        $password = config('app.admin_password');

        if (empty($email) || empty($password)) {
            $this->command->warn('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping AdminUserSeeder.');
            return;
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'     => 'Admin',
                'password' => Hash::make($password),
                'role'     => 'admin',
                'locale'   => 'ro',
            ]
        );

        // Assign Spatie role (idempotent — syncRoles replaces existing)
        $user->syncRoles(['admin']);

        $this->command->info("Admin user ready: {$email}");
    }
}
