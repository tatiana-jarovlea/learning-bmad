# Epic 1: Foundation & Authentication

**Goal:** Stand up a working polyrepo project with CI basics, AWS environment, three-role user system, and role-specific dashboard shells. After this epic, a developer can register as any role, log in, and land on the correct dashboard — and the platform can send an email.

---

## Story 1.1 — Project Scaffolding & AWS Environment Setup

_As a developer, I want a working local dev environment and AWS staging environment so that I can build and test all subsequent features in a production-like context._

**Acceptance Criteria:**

1. `pawtrust-frontend` repo: React 18 + TypeScript + TailwindCSS project initialized with React Router and Axios. `npm run dev` serves locally on port 3000.
2. `pawtrust-backend` repo: Laravel 11 + PHP 8.2 project initialized with Laravel Sanctum and Laravel Queue configured. `php artisan serve` runs locally on port 8000.
3. Docker Compose file in `pawtrust-backend` starts PHP app + MySQL 8 container. `docker-compose up` results in working local stack.
4. AWS staging environment provisioned: EC2 instance (or Elastic Beanstalk), RDS MySQL 8 instance, S3 bucket (private), SES verified domain, CloudFront distribution. All connected and accessible from deployed Laravel app.
5. `.env.example` files in both repos document all required environment variables. No secrets committed to version control.
6. `README.md` in both repos documents local setup steps, env var requirements, and how to run tests.
7. HTTPS enforced on staging (SSL certificate via ACM or Let's Encrypt).

---

## Story 1.2 — User Registration (3 Roles)

_As a new user, I want to register as a Buyer, Breeder, or Pet Sitter so that I can access features relevant to my role._

**Acceptance Criteria:**

1. Registration form collects: name, email, password (min 8 chars), role selection (Buyer / Breeder / Pet Sitter).
2. Backend validates: email uniqueness, password strength, role is one of the three valid values.
3. Passwords stored as bcrypt hashes (Laravel default). Never stored in plain text.
4. Successful registration returns a JWT token (via Laravel Sanctum) and user object (id, name, email, role).
5. Failed registration returns validation errors with specific field-level messages.
6. API endpoint: `POST /api/register`
7. Frontend registration form submits to this endpoint and redirects to role-appropriate dashboard on success.
8. Can be verified locally: `curl -X POST http://localhost:8000/api/register` with valid payload returns token.

---

## Story 1.3 — Login, JWT Auth & Logout

_As a registered user, I want to log in with my email and password so that I can access my account, and log out to end my session._

**Acceptance Criteria:**

1. Login endpoint: `POST /api/login` — accepts email + password, returns JWT token + user object (id, name, email, role).
2. Invalid credentials return 401 with generic error message (do not specify whether email or password is wrong — prevents enumeration).
3. JWT token expires after 24 hours.
4. Logout endpoint: `POST /api/logout` — invalidates current token (Sanctum token deletion). Returns 200.
5. All protected API routes return 401 if no valid token provided.
6. Frontend stores JWT in memory (or httpOnly cookie — not localStorage for security). Axios interceptor attaches token to all requests.
7. Frontend clears token and redirects to login on logout or on 401 response.
8. Rate limiting: max 10 login attempts per IP per minute. Returns 429 on breach.
9. Can be verified locally: login → get token → call a protected endpoint → logout → verify token rejected.

---

## Story 1.4 — Role-Based Dashboard Shells

_As a logged-in user, I want to see a dashboard appropriate to my role so that I have a clear starting point for my tasks._

**Acceptance Criteria:**

1. Three distinct dashboard shell components: `BuyerDashboard`, `BreederDashboard`, `AdminDashboard` (PetSitter dashboard deferred to Epic 5).
2. After login, frontend reads role from JWT/user object and routes to correct dashboard.
3. Each dashboard shell shows: navigation sidebar/header with role-relevant menu items, empty-state placeholder (e.g., "No listings yet" for Breeder, "No inquiries yet" for Buyer).
4. Admin dashboard accessible only to users with admin role — attempting to access `/admin` as non-admin redirects to home.
5. Navigation includes: language toggle (RO/RU), user name display, logout button.
6. Frontend route guards implemented: protected routes redirect unauthenticated users to login page.

---

## Story 1.5 — Admin User Seeding

_As a developer, I want a seeder that creates an admin user so that the platform has an initial admin for testing and launch._

**Acceptance Criteria:**

1. Laravel seeder `AdminUserSeeder` creates one admin user with configurable credentials via `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
2. Admin role stored in `users` table (role column with enum or string — consistent with roles from Story 1.2, extended to include `admin`).
3. `php artisan db:seed --class=AdminUserSeeder` runs without error on fresh database.
4. Admin user can log in via `POST /api/login` and receives a token with admin role.
5. Seeder is idempotent — running it twice does not create duplicate admin users (uses `firstOrCreate`).
6. Documented in `README.md`.

