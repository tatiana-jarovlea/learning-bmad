# PawTrust — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2026-03-19  
**Product Manager:** John (PM Agent)  
**Status:** Draft — Pending Architecture Review

---

## Table of Contents

1. [Goals](#1-goals)
2. [Background Context](#2-background-context)
3. [Requirements](#3-requirements)
4. [UI Goals](#4-ui-goals)
5. [Technical Assumptions](#5-technical-assumptions)
6. [Epic List](#6-epic-list)
7. [Epic Details](#7-epic-details)
8. [PM Checklist Results](#8-pm-checklist-results)
9. [Next Steps](#9-next-steps)

---

## 1. Goals

- Enable buyers in Moldova and Romania to discover verified breeders and healthy pets with confidence, replacing reliance on unvetted Facebook groups and classified ad sites.
- Give breeders and pet sitters a professional digital presence with trust signals (verified badges, document uploads, cynology achievements) that justify premium pricing.
- Displace low-trust channels (Facebook Groups, 999.md, OLX, Instagram) as the primary discovery method for purebred dogs and cats in Eastern Europe.
- Generate sustainable revenue from day one via pay-per-listing fees (€3 standard / €8 featured), with a clear path to commission-based pet sitter bookings (v2) and partner advertising (v2).
- Reach 50 active verified breeders and 200 registered buyers within 6 months of Moldova launch.
- Lay the technical and content foundation for Romania market expansion at the 6-month milestone, and for breeder subscription tiers and cat-specific trust tracks in v2.

---

## 2. Background Context

The Eastern European pet market — particularly Moldova and Romania — lacks a trustworthy, specialist platform for buying purebred pets. The dominant channels are Facebook Groups, 999.md, OLX Romania, and Instagram pages, all of which are unverified, visually poor, and rife with scammers. Buyers are increasingly burned by fraudulent listings, sick animals, and breeders with no verifiable credentials. Cynology federations (FCI-Moldova, AChR) maintain paper or aging digital records that no consumer-facing platform currently surfaces.

PawTrust is a web platform that bridges this trust gap. It aggregates verified breeder profiles, pet listings with required medical documentation, cynology achievement records, and certified pet sitter portfolios — all in a bilingual (Romanian + Russian) interface built for Eastern European users. The platform's tiered verification model (Verified badge for admin-reviewed docs, clearly labeled Unverified for those who haven't yet submitted) allows supply to grow without gatekeeping, while still giving buyers clear trust signals at every touchpoint.

---

## 3. Requirements

### Functional Requirements

| ID   | Requirement                                                                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1  | The system shall support user registration with three roles: Buyer, Breeder, and Pet Sitter. Email/password registration required; social login is post-MVP.                                                       |
| FR2  | Breeders shall be able to create pet listings with: title, breed, price, location, description, minimum 3 photos, at least one parent photo, and health certificate upload (PDF/image).                            |
| FR3  | Breeders shall be able to upload supporting documents to their profile: cynology federation membership certificate, FCI registration papers, vaccination records, and breed-specific health test results.          |
| FR4  | The platform shall implement a tiered verification model: admin-reviewed document submissions earn a "Verified" badge; breeders who have not submitted are labeled "Unverified" (not blocked).                     |
| FR5  | An admin dashboard shall allow platform staff to review breeder document submissions, approve or reject with notes, assign Verified/Unverified status, and manage listings.                                        |
| FR6  | Buyers shall be able to browse and search listings by: species (dog/cat), breed, location (city/region), price range, and verification status.                                                                     |
| FR7  | Buyers shall be able to submit an inquiry on a listing. Upon submission, the breeder's contact details (phone/email) are revealed to the buyer. Prior to inquiry, contact details are never exposed.               |
| FR8  | Breeders shall be able to add cynology achievement records to their profile: competition titles, FCI/AChR certifications, championship results — displayed as a structured achievements section.                   |
| FR9  | Buyers shall be able to submit a review (1–5 stars + text) for a breeder after a transaction, visible on the breeder profile.                                                                                      |
| FR10 | Pet Sitters shall be able to create a profile with: service area, availability, services offered (boarding, walking, day care), rates, experience description, and a care portfolio (photos).                      |
| FR11 | The platform shall support pay-per-listing for breeders: €3 for a standard listing, €8 for a featured listing. Payment processed via Stripe. Listing remains active for 30 days.                                   |
| FR12 | All user-facing content shall be available in both Romanian (ro) and Russian (ru). Users can toggle language; default determined by browser locale.                                                                |
| FR13 | Verified breeders shall display a prominent "Verified" badge on listing cards and profile pages. Unverified breeders display an "Unverified" label.                                                                |
| FR14 | The system shall send transactional email notifications for: new inquiry received (to breeder), inquiry contact revealed (to buyer), verification status update (to breeder), listing expiry warning (to breeder). |
| FR15 | Breeder contact information (phone, email) shall never be returned in any API response prior to a buyer submitting a verified inquiry. Contact reveal is a server-side gated action.                               |

### Non-Functional Requirements

| ID    | Requirement                                                                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR1  | All uploaded documents and pet photos shall be stored in AWS S3 private buckets. Pre-signed URLs used for time-limited access; no public S3 URLs exposed.                           |
| NFR2  | The platform shall be fully mobile-responsive (web) and meet WCAG AA accessibility standards.                                                                                       |
| NFR3  | All pages shall achieve a Largest Contentful Paint (LCP) of under 3 seconds on a standard mobile connection (4G). Images served via CloudFront CDN.                                 |
| NFR4  | The platform shall comply with GDPR: privacy policy, cookie consent, right to erasure (account deletion), and data export on request.                                               |
| NFR5  | All authentication shall use JWT tokens issued by Laravel Sanctum. Tokens expire after 24 hours; refresh via re-login.                                                              |
| NFR6  | The platform shall be deployed on AWS: EC2 or Elastic Beanstalk (API), RDS MySQL 8 (database), S3 + CloudFront (assets), SES (email). Separate production and staging environments. |
| NFR7  | Admin dashboard routes shall be protected by role-based middleware (admin role only). No admin functionality exposed to buyer/breeder/sitter roles.                                 |
| NFR8  | Breeder contact information (phone/email) shall never appear in any API response payload unless the requesting user has an approved inquiry for that listing. Enforced server-side. |
| NFR9  | The system shall handle 1,000 concurrent users without degradation, as validated by load testing prior to launch.                                                                   |
| NFR10 | Payment flows shall be PCI-compliant via Stripe's hosted payment elements. No raw card data touches PawTrust servers.                                                               |

---

## 4. UI Goals

### Design Philosophy

Visual-first, browse-first experience. Trust signals must be immediately visible on listing cards without requiring clicks. Warm, credible branding — not clinical, not like a classifieds site. Every interaction should reinforce that PawTrust is the trusted specialist, not another Facebook group.

### Core Screens (MVP)

| #   | Screen                           | Key Purpose                                                                                                                         |
| --- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Homepage**                     | Hero search, featured listings carousel, trust badges section ("Why PawTrust"), CTA to register as breeder                          |
| 2   | **Search Results**               | Filterable grid of listing cards; each card shows: photo, breed, price, location, Verified/Unverified badge, breeder name           |
| 3   | **Listing Detail**               | Full listing with photo gallery, health documents (icons, not full access pre-inquiry), parent photos, breeder summary, inquiry CTA |
| 4   | **Breeder Profile**              | Breeder bio, all listings, cynology achievements, reviews, verification status, document summary                                    |
| 5   | **Pet Sitter Profile**           | Service area map/description, services offered, rates, care portfolio photos, contact form                                          |
| 6   | **Listing Creation Form**        | Multi-step form: details → photos → documents → payment; progress indicator                                                         |
| 7   | **Admin Verification Dashboard** | Queue of pending submissions; document viewer; approve/reject with notes; breeder history                                           |
| 8   | **Registration / Login**         | Unified auth flow with role selection on registration; clean, minimal                                                               |
| 9   | **Buyer Dashboard**              | My inquiries (with status and contact reveal), saved listings, submitted reviews                                                    |
| 10  | **Breeder Dashboard**            | My listings (active/expired/draft), verification status, submission history, new inquiry alerts                                     |

### Technical UI Constraints

- **Accessibility:** WCAG AA minimum across all screens
- **Responsive:** Web responsive (mobile, tablet, desktop breakpoints via TailwindCSS)
- **Language Toggle:** Prominent RO / RU switcher in the navigation bar; persisted in localStorage
- **Loading States:** Skeleton screens for listing grids; no blank-page loading
- **Image Optimization:** Lazy loading + WebP format served via CloudFront

---

## 5. Technical Assumptions

### Repository & Architecture

- **Repository structure:** Polyrepo — `pawtrust-frontend` (React) and `pawtrust-backend` (Laravel) as separate repositories
- **Backend architecture:** Laravel Monolith — single Laravel application serving all API endpoints; no microservices at MVP
- **API contract:** REST JSON API; OpenAPI/Swagger documentation generated from code annotations

### Technology Stack

**Frontend:**

- React 18+ with TypeScript
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- React i18next for internationalization
- Jest + React Testing Library for unit/component tests

**Backend:**

- PHP 8.2+ with Laravel 11
- Laravel Sanctum for JWT authentication
- Laravel Queue (database driver at MVP, SQS in production) for async email processing
- Laravel Storage with S3 driver for file management
- PHPUnit for unit and integration tests

**Database:**

- MySQL 8 on AWS RDS
- Laravel Migrations for schema management
- Schema changes planned incrementally, tied to the stories that require them

**Infrastructure:**

- AWS EC2 or Elastic Beanstalk for API hosting
- AWS RDS (MySQL 8) for database
- AWS S3 for file storage (private buckets)
- AWS CloudFront as CDN for assets
- AWS SES for transactional email
- Docker Compose for local development environment

**Payments:**

- Stripe (primary) with hosted payment elements (PCI compliance)
- Local Moldovan gateway (MAIB/Mobiasbancă) — evaluated post-MVP

### Testing Strategy

- **Backend:** PHPUnit — unit tests for business logic, integration tests for API endpoints
- **Frontend:** Jest + React Testing Library — unit and component tests
- **Manual QA:** Required for payment flows, verification workflows, and contact reveal gating
- **Load testing:** Required before production launch (NFR9: 1,000 concurrent users)
- **Smoke tests:** Defined in Epic 6 — critical path tests run post-deploy

### Development Practices

- Docker Compose for local dev (PHP + MySQL + Redis if needed)
- HTTPS enforced in all environments
- Rate limiting on auth endpoints and inquiry submission
- `.env`-based configuration; no secrets in version control
- Staging environment mirrors production for pre-launch validation

---

## 6. Epic List

| Epic       | Title                                 | Summary                                                                                                                                                                  |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Epic 1** | Foundation & Authentication           | Project scaffolding, AWS environment setup, user registration (3 roles), JWT login/logout, role-based dashboard shells, admin user seeding                               |
| **Epic 2** | Breeder Profiles & Listings           | Breeder profile creation, pet listing creation with photos and health documents, public browse and search, listing detail page                                           |
| **Epic 3** | Verification System                   | Breeder document submission workflow, admin review dashboard, Verified/Unverified badge display, verification notification emails                                        |
| **Epic 4** | Inquiry System & Contact Reveal       | Buyer inquiry submission, breeder notification, post-inquiry document access, buyer review submission, buyer dashboard                                                   |
| **Epic 5** | Pet Sitter Profiles & Pay-per-Listing | Pet sitter profile creation, sitter discovery page, Stripe pay-per-listing integration (standard €3 / featured €8), featured listing upgrade                             |
| **Epic 6** | i18n, Polish & Launch Readiness       | Full Romanian + Russian i18n, GDPR compliance (privacy policy, cookie consent, account deletion), performance/SEO, security hardening, smoke testing + production deploy |

**Epic sequencing rationale:**

- Epic 1 is foundational — all other epics depend on auth and infrastructure.
- Epic 2 creates the supply side (breeder listings) — required before any trust or discovery features.
- Epic 3 adds the trust layer on top of Epic 2 listings.
- Epic 4 closes the buyer loop — depends on listings (Epic 2) and trust signals (Epic 3).
- Epic 5 adds the pet sitter vertical and monetization — parallel value stream, depends on Epic 1.
- Epic 6 applies to the entire platform — runs last as cross-cutting polish and launch hardening.

---

## 7. Epic Details

---

### Epic 1: Foundation & Authentication

**Goal:** Stand up a working polyrepo project with CI basics, AWS environment, three-role user system, and role-specific dashboard shells. After this epic, a developer can register as any role, log in, and land on the correct dashboard — and the platform can send an email.

---

**Story 1.1 — Project Scaffolding & AWS Environment Setup**

_As a developer, I want a working local dev environment and AWS staging environment so that I can build and test all subsequent features in a production-like context._

**Acceptance Criteria:**

- `pawtrust-frontend` repo: React 18 + TypeScript + TailwindCSS project initialized with React Router and Axios. `npm run dev` serves locally on port 3000.
- `pawtrust-backend` repo: Laravel 11 + PHP 8.2 project initialized with Laravel Sanctum and Laravel Queue configured. `php artisan serve` runs locally on port 8000.
- Docker Compose file in `pawtrust-backend` starts PHP app + MySQL 8 container. `docker-compose up` results in working local stack.
- AWS staging environment provisioned: EC2 instance (or Elastic Beanstalk), RDS MySQL 8 instance, S3 bucket (private), SES verified domain, CloudFront distribution. All connected and accessible from deployed Laravel app.
- `.env.example` files in both repos document all required environment variables. No secrets committed to version control.
- `README.md` in both repos documents local setup steps, env var requirements, and how to run tests.
- HTTPS enforced on staging (SSL certificate via ACM or Let's Encrypt).

---

**Story 1.2 — User Registration (3 Roles)**

_As a new user, I want to register as a Buyer, Breeder, or Pet Sitter so that I can access features relevant to my role._

**Acceptance Criteria:**

- Registration form collects: name, email, password (min 8 chars), role selection (Buyer / Breeder / Pet Sitter).
- Backend validates: email uniqueness, password strength, role is one of the three valid values.
- Passwords stored as bcrypt hashes (Laravel default). Never stored in plain text.
- Successful registration returns a JWT token (via Laravel Sanctum) and user object (id, name, email, role).
- Failed registration returns validation errors with specific field-level messages.
- API endpoint: `POST /api/register`
- Frontend registration form submits to this endpoint and redirects to role-appropriate dashboard on success.
- Can be verified locally: `curl -X POST http://localhost:8000/api/register` with valid payload returns token.

---

**Story 1.3 — Login, JWT Auth & Logout**

_As a registered user, I want to log in with my email and password so that I can access my account, and log out to end my session._

**Acceptance Criteria:**

- Login endpoint: `POST /api/login` — accepts email + password, returns JWT token + user object (id, name, email, role).
- Invalid credentials return 401 with generic error message (do not specify whether email or password is wrong — prevents enumeration).
- JWT token expires after 24 hours.
- Logout endpoint: `POST /api/logout` — invalidates current token (Sanctum token deletion). Returns 200.
- All protected API routes return 401 if no valid token provided.
- Frontend stores JWT in memory (or httpOnly cookie — not localStorage for security). Axios interceptor attaches token to all requests.
- Frontend clears token and redirects to login on logout or on 401 response.
- Rate limiting: max 10 login attempts per IP per minute. Returns 429 on breach.
- Can be verified locally: login → get token → call a protected endpoint → logout → verify token rejected.

---

**Story 1.4 — Role-Based Dashboard Shells**

_As a logged-in user, I want to see a dashboard appropriate to my role so that I have a clear starting point for my tasks._

**Acceptance Criteria:**

- Three distinct dashboard shell components: `BuyerDashboard`, `BreederDashboard`, `AdminDashboard` (PetSitter dashboard deferred to Epic 5).
- After login, frontend reads role from JWT/user object and routes to correct dashboard.
- Each dashboard shell shows: navigation sidebar/header with role-relevant menu items, empty-state placeholder (e.g., "No listings yet" for Breeder, "No inquiries yet" for Buyer).
- Admin dashboard accessible only to users with admin role — attempting to access `/admin` as non-admin redirects to home.
- Navigation includes: language toggle (RO/RU), user name display, logout button.
- Frontend route guards implemented: protected routes redirect unauthenticated users to login page.

---

**Story 1.5 — Admin User Seeding**

_As a developer, I want a seeder that creates an admin user so that the platform has an initial admin for testing and launch._

**Acceptance Criteria:**

- Laravel seeder `AdminUserSeeder` creates one admin user with configurable credentials via `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- Admin role stored in `users` table (role column with enum or string — consistent with roles from Story 1.2, extended to include `admin`).
- `php artisan db:seed --class=AdminUserSeeder` runs without error on fresh database.
- Admin user can log in via `POST /api/login` and receives a token with admin role.
- Seeder is idempotent — running it twice does not create duplicate admin users (uses `firstOrCreate`).
- Documented in `README.md`.

---

### Epic 2: Breeder Profiles & Listings

**Goal:** Breeders can create a public profile and post pet listings with photos and health documents. Buyers can browse, search, and view listing and breeder detail pages. This creates the core supply-side content that the rest of the platform is built around.

---

**Story 2.1 — Breeder Profile Creation & Public View**

_As a breeder, I want to create and manage my public profile so that buyers can learn about me, my kennel, and my credentials before contacting me._

**Acceptance Criteria:**

- Breeder can fill in profile fields: kennel name, description (rich text, max 1000 chars), location (city + region dropdown from defined list), years active, breeds specialization (multi-select from breed list), profile photo (upload, stored on S3).
- Profile is saved via `POST /api/breeder/profile` (create) and `PUT /api/breeder/profile` (update). Auth required, breeder role only.
- Public profile accessible at `/breeders/{id}` (no auth required). Returns: kennel name, description, location, years active, breeds, profile photo URL (CloudFront pre-signed short-TTL), all active listings, verification status.
- Breeder contact details (phone, email) NOT returned on public profile API response.
- Incomplete profiles (missing required fields) display a "Complete your profile" prompt in BreederDashboard.
- Can be verified locally: create profile via API, fetch public profile, confirm contact not exposed.

---

**Story 2.2 — Pet Listing Creation with Photos**

_As a breeder, I want to create a pet listing with photos so that buyers can see my available pets._

**Acceptance Criteria:**

- Listing creation form collects: species (dog/cat), breed (searchable dropdown from seed list), gender, date of birth, price (EUR), location (inherited from breeder profile, overridable), title, description (max 500 chars), listing type (standard €3 / featured €8).
- Minimum 3 listing photos required; minimum 1 parent photo required. All uploaded to S3 private bucket. Photos displayed via CloudFront pre-signed URLs.
- Photo upload: max 5MB per photo, JPEG/PNG/WebP only. Max 10 photos per listing. File type validated server-side (not just MIME type — check file magic bytes).
- Health certificate upload required (PDF or image, max 10MB). Stored on S3, private.
- Listing saved with status `draft` until payment is complete (Story 5.3 handles payment; for Epic 2 dev/testing, a bypass flag in `.env` (`SKIP_LISTING_PAYMENT=true`) allows publishing without payment).
- With bypass enabled: `POST /api/listings` saves listing and sets status to `active`.
- API: `GET /api/listings/{id}` returns full listing data. Health certificate NOT included in response pre-inquiry (filename shown as icon, no URL).
- Breeder dashboard lists all their listings with status (active/draft/expired).

---

**Story 2.3 — Breeder Document Upload (Profile Documents)**

_As a breeder, I want to upload my credentials and certifications to my profile so that buyers and admins can verify my legitimacy._

**Acceptance Criteria:**

- Breeders can upload documents to their profile: cynology federation membership certificate, FCI/AChR registration papers, vaccination records, breed health test results. Each document has a type label.
- Upload via `POST /api/breeder/documents` — multipart form with file + document_type. Auth required, breeder role only.
- Files stored in S3 private bucket. Max 10MB per document. PDF and image formats accepted. File type validated server-side (magic bytes).
- Documents listed in breeder profile API response as: `{ id, type, filename, uploaded_at, status }` — no URL returned (access controlled separately).
- Admin can access document URLs via pre-signed S3 URLs in the admin dashboard (Story 3.2).
- Breeder can delete their own uploaded documents (sets status to `deleted`, S3 object not immediately purged — retained for 30 days for audit).
- Document count visible on public breeder profile (e.g., "3 documents on file") without revealing content.

---

**Story 2.4 — Browse & Search Listings**

_As a buyer, I want to browse and search pet listings so that I can find a pet that matches what I'm looking for._

**Acceptance Criteria:**

- Public endpoint `GET /api/listings` returns paginated (20 per page) listing cards: id, title, breed, species, price, location, main photo URL (CloudFront), breeder name, verification status badge (verified/unverified).
- Filter parameters: `species`, `breed`, `location_city`, `location_region`, `price_min`, `price_max`, `verified_only` (boolean).
- Default sort: featured listings first, then by `created_at` desc.
- Search by keyword (`?q=golden retriever`) matches against title, breed, description (MySQL FULLTEXT or LIKE — architect decision).
- No auth required for browsing. Contact details never in listing card response.
- Frontend renders as responsive grid; skeleton loading state while fetching.
- Filters persist in URL query params (shareable filtered search links).
- Empty state: "No listings match your search" with a suggestion to broaden filters.

---

**Story 2.5 — Listing Detail Page**

_As a buyer, I want to view a full listing page so that I can assess a pet before deciding to make an inquiry._

**Acceptance Criteria:**

- Public endpoint `GET /api/listings/{id}` returns full listing data: all fields from Story 2.2, all photos (CloudFront pre-signed URLs, TTL 1 hour), parent photos, breeder profile summary (name, location, verified status, kennel name, years active, breed specializations), achievement highlights (count + latest title), review summary (average rating + count).
- Health certificate shown as a document icon with label ("Health Certificate on file") — NO download URL returned pre-inquiry.
- Contact details (phone/email) NOT in response.
- Page includes: "Submit Inquiry to Access Contact & Documents" CTA button (visible to logged-in buyers; prompts login for unauthenticated users).
- Cynology achievements section: list of achievement records (title, federation, year) from breeder profile.
- Reviews section: last 5 reviews (stars + text excerpt), link to full breeder profile for all reviews.
- Breadcrumb navigation: Home → Search Results → [Listing Title].
- Can be verified locally: create listing, fetch detail, confirm no contact/document URLs in response.

---

### Epic 3: Verification System

**Goal:** Breeders can submit their credentials for admin review. Admins can review, approve, or reject submissions via a dedicated dashboard. Verified breeders receive a badge visible on all their listings and profile. All status changes trigger email notifications.

---

**Story 3.1 — Breeder Verification Request Submission**

_As a breeder, I want to submit a verification request so that I can earn a Verified badge and build buyer trust._

**Acceptance Criteria:**

- Verification request submitted via `POST /api/verification/submit`. Auth required, breeder role only.
- Request requires: at least 1 document uploaded (Story 2.3) to be associated. Breeders select which documents to include in the submission.
- Submission creates a verification record with status `pending`. Breeders cannot submit a new request while one is `pending` or `under_review`.
- Breeder dashboard shows current verification status: `Not Submitted`, `Pending Review`, `Under Review`, `Verified`, `Rejected (with admin notes)`.
- On rejection, admin notes are visible to the breeder in the dashboard. Breeder can resubmit (creates new verification record, does not overwrite history).
- Rejected breeders retain `Unverified` label (not blocked from listing).
- Verification submission history stored (each submission as separate record for audit trail).

---

**Story 3.2 — Admin Verification Review Dashboard**

_As an admin, I want to review breeder verification submissions so that I can approve or reject credentials and maintain platform trust._

**Acceptance Criteria:**

- Admin dashboard route `/admin/verification` lists all submissions with status filter (pending, under_review, approved, rejected). Paginated (20 per page).
- Each submission shows: breeder name, kennel name, submission date, document list with view links, current status.
- Admin can click to view individual documents via time-limited pre-signed S3 URLs (generated server-side on demand, TTL 15 minutes). URL generation endpoint: `GET /api/admin/documents/{id}/preview`. Admin role required.
- Admin can: set status to `under_review` (locks resubmission), `approved` (triggers Verified badge), `rejected` (requires notes field, min 20 chars).
- Status update endpoint: `POST /api/admin/verification/{id}/review` — body: `{ status, notes }`. Admin role required.
- On approval: breeder's `verified` flag set to `true` in database. Reflected immediately on public profile and all listings.
- On rejection: breeder's `verified` flag remains `false`. Rejection notes stored and visible to breeder.
- All admin actions logged with timestamp and admin user ID (audit log table).

---

**Story 3.3 — Verified/Unverified Badge Display**

_As a buyer, I want to clearly see whether a breeder is verified on listing cards and profiles so that I can make an informed trust decision quickly._

**Acceptance Criteria:**

- Verified breeders: green checkmark + "Verified" label displayed on listing card (search results), listing detail page, and breeder public profile.
- Unverified breeders: grey "Unverified" label displayed in same positions — not hidden, not visually alarming, but clearly differentiated.
- Badge state driven by `verified` boolean on breeder record — updated in real time by admin actions (Story 3.2).
- Tooltip on badge: Verified = "Documents reviewed and approved by PawTrust team"; Unverified = "This breeder has not yet submitted verification documents."
- Badge visible without scrolling on listing cards (above the fold on mobile).
- Filter "Verified breeders only" on search results works correctly (Story 2.4 `?verified_only=true`).

---

**Story 3.4 — Verification Status Email Notifications**

_As a breeder, I want to receive email notifications when my verification status changes so that I know when to take action._

**Acceptance Criteria:**

- On verification submission received: email sent to admin team address (configurable via `ADMIN_NOTIFICATION_EMAIL` env var) — subject: "New verification submission from [Kennel Name]".
- On status change to `under_review`: email sent to breeder — "Your verification is under review."
- On status change to `approved`: email sent to breeder — "Congratulations! You are now Verified on PawTrust." Includes link to their public profile.
- On status change to `rejected`: email sent to breeder — includes admin rejection notes and CTA to update documents and resubmit.
- All emails sent via Laravel Queue (async) → AWS SES. Emails do not block API response.
- Emails available in both Romanian and Russian based on user's registered language preference.
- Can be verified locally using Laravel's `log` mail driver (emails appear in `storage/logs/`).

---

### Epic 4: Inquiry System & Contact Reveal

**Goal:** Buyers can express interest in a listing. The breeder is notified. The buyer gains access to the breeder's contact details and listing documents after submitting an inquiry. Buyers can leave reviews. Buyers have a dashboard to track their activity.

---

**Story 4.1 — Inquiry Submission**

_As a buyer, I want to submit an inquiry on a listing so that I can contact the breeder and access their documents._

**Acceptance Criteria:**

- Inquiry submission endpoint: `POST /api/listings/{id}/inquire`. Auth required, buyer role only. Breeders cannot inquire on listings.
- Request body: optional message (max 500 chars).
- Creates an inquiry record: listing_id, buyer_id, message, status (`pending`), `created_at`.
- One inquiry per buyer per listing enforced — duplicate inquiry returns 409 with message "You have already inquired about this listing."
- On successful inquiry: response includes `{ inquiry_id, breeder_contact: { phone, email, name } }` — this is the ONLY API endpoint that returns breeder contact details.
- Inquiry status set to `contact_revealed` automatically upon successful submission (no additional step required from buyer or breeder).
- Can be verified locally: create listing, submit inquiry, verify contact details returned, verify a second inquiry attempt returns 409.

---

**Story 4.2 — Breeder Notification on New Inquiry**

_As a breeder, I want to be notified when a buyer submits an inquiry so that I can respond promptly._

**Acceptance Criteria:**

- On inquiry submission (Story 4.1): email sent to breeder immediately (via Laravel Queue → AWS SES).
- Email contains: buyer's name, optional message, listing title, link to the listing in BreederDashboard.
- Email available in both Romanian and Russian based on breeder's language preference.
- New inquiry count shown as a badge/counter in the BreederDashboard navigation (unread count).
- BreederDashboard inquiry list: shows each inquiry with buyer name, date, listing title, message excerpt, status.
- Can be verified locally: submit inquiry, check mail log for breeder notification email.

---

**Story 4.3 — Post-Inquiry Document Access**

_As a buyer who has submitted an inquiry, I want to access the listing's health documents so that I can review the pet's medical history._

**Acceptance Criteria:**

- After inquiry submission, buyer can access listing documents via `GET /api/inquiries/{inquiry_id}/documents`.
- Auth required. Requesting user must be the buyer who submitted the inquiry (enforced server-side).
- Response: list of documents `{ id, type, filename }` with time-limited pre-signed S3 URLs (TTL 1 hour) for download.
- Non-authorized users (other buyers, unauthenticated) receive 403.
- Documents accessible as long as the inquiry exists (no expiry on document access post-inquiry).
- Frontend: "View Documents" button appears on inquiry card in BuyerDashboard after inquiry is submitted. Clicking generates and opens document URLs.

---

**Story 4.4 — Review Submission**

_As a buyer, I want to leave a review for a breeder after a transaction so that I can help other buyers make informed decisions._

**Acceptance Criteria:**

- Review submission endpoint: `POST /api/breeders/{id}/reviews`. Auth required, buyer role only.
- Request body: `{ rating: 1-5, text: string (max 500 chars) }`.
- One review per buyer per breeder enforced — duplicate returns 409.
- Review is immediately visible on the breeder's public profile (no moderation queue at MVP — admin can delete via admin dashboard if reported).
- Reviews displayed on public breeder profile: star rating, text, buyer first name + last initial, date.
- Breeder profile shows aggregate: average rating (1 decimal place) + total review count.
- BuyerDashboard: "Leave a Review" CTA appears for breeders the buyer has an approved inquiry with. If review already submitted, shows "Review Submitted" (no edit at MVP).

---

**Story 4.5 — Buyer Dashboard**

_As a buyer, I want a dashboard where I can track my inquiries and reviews so that I can manage my activity on PawTrust._

**Acceptance Criteria:**

- BuyerDashboard route: `/dashboard/buyer` — auth required, buyer role only.
- **My Inquiries** section: list of all inquiries submitted by the buyer. Each inquiry card shows: listing photo, breed/title, breeder name, date submitted, status, and "View Contact Details" button (re-fetches contact from inquiry, always available post-submission) and "View Documents" button (triggers Story 4.3).
- **My Reviews** section: list of reviews submitted by the buyer (breeder name, rating, date, text excerpt).
- **Saved Listings** section: list of listings the buyer has bookmarked (heart icon on listing cards adds to saved list; `POST /api/listings/{id}/save` and `DELETE /api/listings/{id}/save`). Saved listings persist across sessions.
- Empty states for each section with helpful CTA (e.g., "Browse listings to find your next pet").
- BuyerDashboard is the landing page for buyers after login.

---

### Epic 5: Pet Sitter Profiles & Pay-per-Listing

**Goal:** Pet sitters can create a discoverable profile. Buyers can find sitters by location. Stripe pay-per-listing is live for breeders (standard €3 / featured €8). Breeders can upgrade to featured listings.

---

**Story 5.1 — Pet Sitter Profile Creation & Management**

_As a pet sitter, I want to create a profile that showcases my services so that pet owners can find and contact me._

**Acceptance Criteria:**

- Pet Sitter profile fields: full name, bio (max 500 chars), service area (city/region, up to 3 areas), services offered (checkboxes: boarding, dog walking, day care, drop-in visits), rates (text field, e.g., "€15/night boarding"), experience (years), languages spoken, care portfolio (photo upload, max 6 photos, S3 stored, CloudFront served).
- Profile creation/update: `POST /api/sitter/profile`, `PUT /api/sitter/profile`. Auth required, pet_sitter role only.
- Public sitter profile at `/sitters/{id}`: returns all fields above (no contact details). Contact form button is CTA.
- Contact form on sitter profile: `POST /api/sitters/{id}/contact` — sends name + email + message to sitter via AWS SES. No contact details exposed in response. Rate-limited: 5 submissions per IP per hour.
- SitterDashboard shell: profile editor + contact submissions received (list of name, date, message).
- Profile completeness prompt if required fields missing.

---

**Story 5.2 — Pet Sitter Discovery Page**

_As a buyer or pet owner, I want to browse pet sitters by location so that I can find care for my pet locally._

**Acceptance Criteria:**

- Public endpoint `GET /api/sitters` — returns paginated list of sitter cards: name, service area, services offered (icon list), rates, profile photo, bio excerpt, average review would come in v2 (show "-" for now).
- Filter by: service area (city/region), service type (boarding/walking/daycare/drop-in).
- Default sort: most recently updated profile first.
- No auth required for browsing sitter discovery page.
- Frontend: `/sitters` route with filter sidebar, responsive grid of sitter cards, each card links to `/sitters/{id}`.
- Empty state: "No sitters found in [location]. Try expanding your area."

---

**Story 5.3 — Stripe Pay-per-Listing Integration**

_As a breeder, I want to pay for my listing via Stripe so that my listing goes live and is visible to buyers._

**Acceptance Criteria:**

- When creating a listing (Story 2.2) with `SKIP_LISTING_PAYMENT=false` (production mode), listing is saved with status `pending_payment`.
- Payment initiation: `POST /api/listings/{id}/payment/initiate` returns a Stripe Checkout Session URL. Auth required, breeder role, must own the listing.
- Stripe Checkout configured: standard listing €3.00 EUR, featured listing €8.00 EUR. PCI-compliant (hosted Stripe Checkout page — no raw card data on PawTrust servers).
- Stripe webhook endpoint: `POST /api/webhooks/stripe` — handles `checkout.session.completed` event. On success: sets listing status to `active`, sets `listed_at` timestamp. Webhook signature verified using `STRIPE_WEBHOOK_SECRET`.
- On payment success: listing immediately appears in search results.
- On payment failure or abandonment: listing remains in `pending_payment` status. Breeder can retry payment from BreederDashboard.
- BreederDashboard listing manager shows listing status and "Complete Payment" CTA for pending_payment listings.
- Test mode: Stripe test keys (`STRIPE_KEY`, `STRIPE_SECRET` env vars) used in local/staging. Production keys used in prod.
- Can be verified locally: use Stripe test card, complete checkout, verify webhook fires, listing status changes to `active`.

---

**Story 5.4 — Featured Listing Upgrade**

_As a breeder with an active listing, I want to upgrade to a featured listing so that my listing appears at the top of search results._

**Acceptance Criteria:**

- Active listings (status = `active`) can be upgraded to featured via: `POST /api/listings/{id}/upgrade-to-featured`. Auth required, breeder role, must own the listing. Listing must not already be featured.
- Initiates a Stripe Checkout Session for the upgrade price: featured price (€8) minus standard price already paid (€3) = €5 upgrade fee. If listing was originally created as standard, charge €5. If originally created as featured (already paid €8), upgrade endpoint returns 400 "Listing is already featured."
- On payment success (Stripe webhook): listing `featured` boolean set to `true`. Listing moves to top of default sort in search results.
- Featured badge displayed on listing cards in search results: "Featured" label (visually distinct from Verified badge).
- Featured status lasts for the remainder of the listing's 30-day active period (no separate featured expiry).
- BreederDashboard: "Upgrade to Featured (€5)" CTA on active standard listings.

---

### Epic 6: i18n, Polish & Launch Readiness

**Goal:** Platform is fully bilingual (Romanian + Russian), GDPR-compliant, performant, security-hardened, and passes a smoke test suite. Ready for Moldova production launch.

---

**Story 6.1 — Full Romanian + Russian Internationalization**

_As a user in Moldova or Romania, I want the entire platform interface in my preferred language so that I can use the platform comfortably._

**Acceptance Criteria:**

- All user-facing UI strings (labels, buttons, error messages, empty states, email subjects/bodies) available in both Romanian (`ro`) and Russian (`ru`). No English visible to end users in production.
- Frontend: React i18next with locale files `public/locales/ro/translation.json` and `public/locales/ru/translation.json`. Language stored in localStorage. Default: browser locale detection (`ro` preferred, fallback `ru`, then `ro`).
- Backend: Laravel localization files `lang/ro/` and `lang/ru/` for all API validation messages and email templates.
- Language toggle (RO / RU) in navigation bar — switches all UI text instantly without page reload.
- All transactional emails (Stories 3.4, 4.2, 5.1) sent in user's preferred language (stored on user record as `language` field, defaults to `ro`).
- Date formats localized: Romanian format (DD.MM.YYYY), Russian format (DD.MM.YYYY — same in this region).
- Currency displayed as EUR throughout (no localization needed).
- QA: full manual walkthrough of all 10 core screens in both languages before launch sign-off.

---

**Story 6.2 — GDPR Compliance**

_As a user, I want to know how my data is used and have control over it so that I can use PawTrust with confidence in my privacy rights._

**Acceptance Criteria:**

- Privacy Policy page (`/privacy`) — written in Romanian and Russian. Covers: data collected, how it's used, third-party processors (AWS, Stripe, SES), user rights, contact for data requests.
- Cookie consent banner on first visit: "Accept all" / "Reject non-essential" (analytics only at MVP — no third-party tracking at launch, so banner is informational). Consent stored in localStorage.
- Account deletion: `DELETE /api/account` endpoint — soft-deletes user record (sets `deleted_at`), anonymizes personal data (name → "Deleted User", email → `deleted_{id}@pawtrust.md`), revokes all tokens, removes all S3 documents for that user within 30 days (background job). Returns 200.
- Data export: `GET /api/account/export` — returns JSON of all user-owned data (profile, listings, inquiries, reviews). Intended for manual fulfillment of data subject access requests (full automation is post-MVP).
- Terms of Service page (`/terms`) — linked in footer, in both languages.
- All forms include privacy notice: "By registering, you agree to our [Privacy Policy] and [Terms of Service]."
- Footer links: Privacy Policy, Terms of Service, Contact Us (email address).

---

**Story 6.3 — Performance & SEO Foundations**

_As PawTrust, I want the platform to load fast and be discoverable on search engines so that we can grow organically._

**Acceptance Criteria:**

- All listing and breeder profile pages have: unique `<title>` tags, `<meta name="description">`, Open Graph tags (og:title, og:description, og:image) populated with listing/breeder data.
- Homepage and key landing pages have structured data (JSON-LD for Organization schema).
- React app uses React Helmet (or equivalent) for dynamic head management.
- Images: WebP format served via CloudFront. Lazy loading on all listing grid images. Main listing photo (LCP candidate) eagerly loaded.
- Lighthouse audit on listing detail and search results pages: Performance ≥ 80, LCP < 3s on simulated 4G mobile. Run audit and document results before launch sign-off.
- `sitemap.xml` generated and submitted (manual or script — auto-generation is post-MVP). At minimum, static routes included.
- `robots.txt` configured: allow all crawlers for public pages; disallow `/api/`, `/admin/`, `/dashboard/`.

---

**Story 6.4 — Security Hardening**

_As PawTrust, I want the platform to be hardened against common attacks so that user data and the platform are protected at launch._

**Acceptance Criteria:**

- All API endpoints validated for auth (no unintentionally public endpoints).
- SQL injection prevention: all database queries use Laravel Eloquent ORM or Query Builder with parameterized queries. Raw SQL queries audited (grep for `DB::statement`, `DB::unprepared`).
- XSS prevention: all user-generated content (listing descriptions, bios, messages) HTML-escaped on output. Laravel's Blade `{{ }}` used (double-braces escape by default). React JSX auto-escapes strings.
- CSRF protection: Laravel CSRF middleware active on all non-API routes. API routes use Sanctum token auth (stateless, no CSRF needed).
- HTTPS enforced: HTTP requests redirected to HTTPS at load balancer / web server level.
- Security headers set on all responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (baseline — no inline scripts in production).
- S3 bucket policy: no public read access on document/photo buckets. Only pre-signed URL access allowed.
- Stripe webhook signature verification active (Story 5.3 — confirm enabled in production config).
- Rate limiting verified on: login endpoint (10/min/IP), inquiry submission (5/hour/IP), sitter contact form (5/hour/IP).
- Dependency audit: `composer audit` and `npm audit` run. No critical or high severity CVEs unaddressed.

---

**Story 6.5 — Smoke Testing & Production Deploy**

_As PawTrust, I want a suite of smoke tests and a validated production deployment so that we can launch with confidence._

**Acceptance Criteria:**

- Smoke test script documented in `docs/smoke-tests.md` — covers the critical user paths:
  1. Register as Buyer → Login → Browse listings → Submit inquiry → Receive contact details
  2. Register as Breeder → Create listing → Pay via Stripe test mode → Listing appears in search
  3. Submit verification documents → Admin approves → Verified badge appears on listing
  4. Register as Pet Sitter → Create profile → Profile appears on sitter discovery page
  5. Admin login → Access admin dashboard → No access as non-admin (confirm 403)
- All smoke tests pass on staging environment before production deploy.
- Production environment provisioned (separate from staging): EC2/EB, RDS, S3 (prod buckets), CloudFront, SES with production domain, Stripe live keys.
- Database migrations run successfully on production RDS. Admin user seeded.
- DNS configured: primary domain points to CloudFront (frontend) and API subdomain points to production API.
- Post-deploy checklist completed: HTTPS working, emails flowing (test email sent via SES production), Stripe live mode active, smoke tests passing on production.
- Rollback plan documented: if critical issue found post-deploy, steps to revert to previous build.

---

## 8. PM Checklist Results

### Checklist Execution Summary

**Date reviewed:** 2026-03-19  
**PRD Version:** 1.0  
**Reviewer:** John (PM Agent)

---

### Executive Summary

| Metric                       | Result                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| **Overall PRD Completeness** | 91%                                                           |
| **MVP Scope Assessment**     | Just Right                                                    |
| **Architecture Readiness**   | Ready                                                         |
| **Most Critical Gap**        | Listing expiry/renewal flow not explicitly defined in stories |

---

### Category Analysis

| Category                         | Status      | Notes                                                                                                                                                             |
| -------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem Definition & Context  | **PASS**    | Clear problem, target users, market evidence from market research doc, competitive analysis, measurable KPIs                                                      |
| 2. MVP Scope Definition          | **PASS**    | Scope boundaries documented; post-MVP features explicitly called out (subscriptions, video, social login, cat trust track); pay-per-listing decision rationalized |
| 3. User Experience Requirements  | **PASS**    | 10 core screens defined; WCAG AA specified; responsive; language toggle; loading states; error states in stories                                                  |
| 4. Functional Requirements       | **PASS**    | 15 FRs documented; testable; dependencies implicit in epic order; contact privacy enforced in FR15/NFR8                                                           |
| 5. Non-Functional Requirements   | **PASS**    | 10 NFRs; performance target set; security, GDPR, PCI, load testing all addressed                                                                                  |
| 6. Epic & Story Structure        | **PASS**    | 6 epics, 28 stories total; first epic has scaffolding + seeding; stories have acceptance criteria; local testability included                                     |
| 7. Technical Guidance            | **PASS**    | Full stack specified; polyrepo/monolith documented; deployment environment defined; payment and i18n approach specified                                           |
| 8. Cross-Functional Requirements | **PARTIAL** | Data entities referenced but no explicit ERD; listing expiry/renewal not fully specified in stories                                                               |
| 9. Clarity & Communication       | **PASS**    | Consistent terminology throughout; language toggle, Verified/Unverified terms used consistently                                                                   |

---

### Issues by Priority

**HIGH (should address before architect handoff):**

- **Listing expiry/renewal flow:** Listings are 30-day active (FR11, Story 5.3), but no story defines what happens at expiry (email warning referenced in FR14, but no story for the expiry cron job or renewal flow). Architect should flag this for v1.1 or it should become Story 2.2a.
- **Data Entity Summary:** No explicit entity list for the architect. Recommend adding a brief "Key Data Entities" note for the architect prompt (see Next Steps).

**MEDIUM:**

- **Cat breeder trust track:** Mentioned as post-MVP in brief but no explicit callout in PRD. Should be noted as a known v2 epic to avoid architect over-engineering or under-engineering the verification model.
- **Admin reporting/analytics:** No story for platform metrics (listing counts, revenue, breeder signups). Architect may want to know if a reporting layer is anticipated.

**LOW:**

- Review moderation (admin delete) referenced in Story 4.4 but no admin UI story for it — acceptable for MVP (direct DB if needed), but log it.
- Sitter contact rate limit (5/hour) defined in Story 5.1 but not in the NFR table — minor inconsistency.

---

### MVP Scope Assessment

The 6-epic structure is appropriately scoped for an MVP. No unnecessary complexity. The decision to defer video calls, subscription tiers, social login, and mobile apps is correct. The SKIP_LISTING_PAYMENT bypass flag is a pragmatic engineering choice that correctly handles the payment/listing dependency without blocking the Epic 2 dev cycle.

The 28-story count is on the higher end for an MVP but justified given the multi-role complexity (3 user roles + admin) and the trust/verification system as a core differentiator.

---

### Technical Readiness

- Stack is fully specified — architect can begin immediately.
- The polyrepo/monolith decision is clearly documented with rationale.
- The contact reveal gating (FR15, NFR8) is the highest-complexity security requirement and should be a focus area in architecture.
- S3 pre-signed URL pattern is the correct approach for private file access — architect should define TTL strategy per document type.
- Stripe webhook verification is called out — architect should review idempotency (duplicate webhook events).

**Verdict: Ready for Architect handoff.**

---

## 9. Next Steps

### Immediate Actions

1. **Address HIGH priority checklist items** (optional before architect handoff):
   - Add listing expiry/renewal story (or defer to v1.1 with explicit note)
   - Add key data entities summary below for architect reference

2. **Hand off to Architect** — The PRD is ready for technical architecture.

3. **Optionally, hand off to UX Expert** in parallel for UI/UX design work.

---

### Key Data Entities (Architect Reference)

| Entity                     | Key Fields                                                                                                                                                           | Notes                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `users`                    | id, name, email, password_hash, role (buyer/breeder/pet_sitter/admin), language (ro/ru), verified, deleted_at                                                        | Soft delete for GDPR               |
| `breeder_profiles`         | id, user_id, kennel_name, description, location_city, location_region, years_active, profile_photo_s3_key                                                            | 1:1 with users (breeder role)      |
| `pet_listings`             | id, breeder_id, species, breed, gender, dob, price_eur, title, description, location, status (draft/pending_payment/active/expired), featured, listed_at, expires_at | 30-day active window               |
| `listing_photos`           | id, listing_id, s3_key, type (listing/parent), sort_order                                                                                                            |                                    |
| `breeder_documents`        | id, breeder_id, type, s3_key, filename, status (active/deleted), uploaded_at                                                                                         | Used in verification submissions   |
| `verification_submissions` | id, breeder_id, status (pending/under_review/approved/rejected), admin_notes, reviewed_by, reviewed_at                                                               | History preserved                  |
| `verification_documents`   | id, submission_id, document_id                                                                                                                                       | Join table: submission → documents |
| `inquiries`                | id, listing_id, buyer_id, message, status (pending/contact_revealed), created_at                                                                                     | One per buyer per listing          |
| `reviews`                  | id, breeder_id, buyer_id, rating (1-5), text, created_at                                                                                                             | One per buyer per breeder          |
| `sitter_profiles`          | id, user_id, bio, service_areas (JSON), services (JSON), rates, experience_years, languages                                                                          | 1:1 with users (pet_sitter role)   |
| `sitter_photos`            | id, sitter_id, s3_key, sort_order                                                                                                                                    | Care portfolio                     |
| `saved_listings`           | id, buyer_id, listing_id, created_at                                                                                                                                 |                                    |
| `audit_log`                | id, admin_user_id, action, entity_type, entity_id, timestamp                                                                                                         | Admin actions audit trail          |
| `payments`                 | id, listing_id, stripe_session_id, amount_eur, status, created_at                                                                                                    | Stripe payment records             |

---

### Architect Prompt

You are the system Architect for PawTrust. The PRD is ready. Please review [`docs/prd.md`](docs/prd.md) and produce a comprehensive technical architecture document (`docs/architecture.md`) covering:

1. **System architecture overview** — component diagram (frontend, API, DB, S3, SES, Stripe, CloudFront)
2. **Database schema** — full ERD based on the Key Data Entities table in the PRD (Section 9), with relationships, indexes, and constraints
3. **API design** — URL structure, authentication middleware groups, key endpoint definitions
4. **Security architecture** — contact reveal gating implementation, S3 pre-signed URL strategy (per entity TTL), JWT flow, rate limiting implementation
5. **File storage strategy** — S3 bucket structure, access patterns, magic-byte file validation approach
6. **Stripe integration architecture** — checkout session flow, webhook idempotency, payment record design
7. **Email queue architecture** — Laravel Queue → SES flow, job classes, failure handling
8. **i18n architecture** — locale detection, Laravel + React i18next wiring, email template localization
9. **Infrastructure diagram** — AWS services, networking (VPC, security groups), environments (staging vs production)
10. **Technical risks & mitigations** — specifically: listing expiry cron design, S3 pre-signed URL TTL trade-offs, Stripe webhook duplicate handling, contact reveal race condition

Key constraints from PRD: Polyrepo, Laravel Monolith, MySQL 8 RDS, AWS stack, WCAG AA, GDPR soft-delete, PCI via Stripe hosted elements.

---

### UX Expert Prompt

You are the UX Expert for PawTrust. The PRD is ready. Please review [`docs/prd.md`](docs/prd.md) and produce a UX architecture document (`docs/ux-design.md`) covering:

1. **Information architecture** — site map showing all public and authenticated routes, navigation structure
2. **User flow diagrams** — primary flows for each of the 3 user roles (Buyer: browse → inquire → document access; Breeder: register → create listing → pay → verification request; Pet Sitter: register → create profile → discovery)
3. **Wireframes or detailed UI specs** — for all 10 core screens defined in the PRD (Section 4), including mobile and desktop breakpoints
4. **Trust signal design** — how Verified/Unverified badges, document icons, and achievement records are visually communicated on listing cards and profile pages
5. **Component library sketch** — key reusable components (listing card, badge, photo gallery, document icon, language toggle, inquiry CTA)
6. **Accessibility plan** — WCAG AA implementation notes for key interactions (focus management, color contrast, screen reader text for badges and icons)
7. **Bilingual UX considerations** — layout flexibility for Romanian vs Russian string lengths, RTL not required but text expansion handled

Key constraints: Web responsive (TailwindCSS), warm trustworthy branding, browse-first experience, trust signals above the fold on mobile.

---

_PRD complete. PawTrust is ready for architecture and UX design phases._

