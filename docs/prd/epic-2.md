# Epic 2: Breeder Profiles & Listings

**Goal:** Breeders can create a public profile and post pet listings with photos and health documents. Buyers can browse, search, and view listing and breeder detail pages. This creates the core supply-side content that the rest of the platform is built around.

---

## Story 2.1 — Breeder Profile Creation & Public View

_As a breeder, I want to create and manage my public profile so that buyers can learn about me, my kennel, and my credentials before contacting me._

**Acceptance Criteria:**

1. Breeder can fill in profile fields: kennel name, description (rich text, max 1000 chars), location (city + region dropdown from defined list), years active, breeds specialization (multi-select from breed list), profile photo (upload, stored on S3).
2. Profile is saved via `POST /api/breeder/profile` (create) and `PUT /api/breeder/profile` (update). Auth required, breeder role only.
3. Public profile accessible at `/breeders/{id}` (no auth required). Returns: kennel name, description, location, years active, breeds, profile photo URL (CloudFront pre-signed short-TTL), all active listings, verification status.
4. Breeder contact details (phone, email) NOT returned on public profile API response.
5. Incomplete profiles (missing required fields) display a "Complete your profile" prompt in BreederDashboard.
6. Can be verified locally: create profile via API, fetch public profile, confirm contact not exposed.

---

## Story 2.2 — Pet Listing Creation with Photos

_As a breeder, I want to create a pet listing with photos so that buyers can see my available pets._

**Acceptance Criteria:**

1. Listing creation form collects: species (dog/cat), breed (searchable dropdown from seed list), gender, date of birth, price (EUR), location (inherited from breeder profile, overridable), title, description (max 500 chars), listing type (standard €3 / featured €8).
2. Minimum 3 listing photos required; minimum 1 parent photo required. All uploaded to S3 private bucket. Photos displayed via CloudFront pre-signed URLs.
3. Photo upload: max 5MB per photo, JPEG/PNG/WebP only. Max 10 photos per listing. File type validated server-side (not just MIME type — check file magic bytes).
4. Health certificate upload required (PDF or image, max 10MB). Stored on S3, private.
5. Listing saved with status `draft` until payment is complete. For Epic 2 dev/testing, a bypass flag in `.env` (`SKIP_LISTING_PAYMENT=true`) allows publishing without payment.
6. With bypass enabled: `POST /api/listings` saves listing and sets status to `active`.
7. API: `GET /api/listings/{id}` returns full listing data. Health certificate NOT included in response pre-inquiry (filename shown as icon, no URL).
8. Breeder dashboard lists all their listings with status (active/draft/expired).

---

## Story 2.3 — Breeder Document Upload (Profile Documents)

_As a breeder, I want to upload my credentials and certifications to my profile so that buyers and admins can verify my legitimacy._

**Acceptance Criteria:**

1. Breeders can upload documents to their profile: cynology federation membership certificate, FCI/AChR registration papers, vaccination records, breed health test results. Each document has a type label.
2. Upload via `POST /api/breeder/documents` — multipart form with file + document_type. Auth required, breeder role only.
3. Files stored in S3 private bucket. Max 10MB per document. PDF and image formats accepted. File type validated server-side (magic bytes).
4. Documents listed in breeder profile API response as: `{ id, type, filename, uploaded_at, status }` — no URL returned (access controlled separately).
5. Admin can access document URLs via pre-signed S3 URLs in the admin dashboard (Story 3.2).
6. Breeder can delete their own uploaded documents (sets status to `deleted`, S3 object not immediately purged — retained for 30 days for audit).
7. Document count visible on public breeder profile (e.g., "3 documents on file") without revealing content.

---

## Story 2.4 — Browse & Search Listings

_As a buyer, I want to browse and search pet listings so that I can find a pet that matches what I'm looking for._

**Acceptance Criteria:**

1. Public endpoint `GET /api/listings` returns paginated (20 per page) listing cards: id, title, breed, species, price, location, main photo URL (CloudFront), breeder name, verification status badge (verified/unverified).
2. Filter parameters: `species`, `breed`, `location_city`, `location_region`, `price_min`, `price_max`, `verified_only` (boolean).
3. Default sort: featured listings first, then by `created_at` desc.
4. Search by keyword (`?q=golden retriever`) matches against title, breed, description (MySQL FULLTEXT).
5. No auth required for browsing. Contact details never in listing card response.
6. Frontend renders as responsive grid; skeleton loading state while fetching.
7. Filters persist in URL query params (shareable filtered search links).
8. Empty state: "No listings match your search" with a suggestion to broaden filters.

---

## Story 2.5 — Listing Detail Page

_As a buyer, I want to view a full listing page so that I can assess a pet before deciding to make an inquiry._

**Acceptance Criteria:**

1. Public endpoint `GET /api/listings/{id}` returns full listing data: all fields from Story 2.2, all photos (CloudFront pre-signed URLs, TTL 1 hour), parent photos, breeder profile summary (name, location, verified status, kennel name, years active, breed specializations), achievement highlights (count + latest title), review summary (average rating + count).
2. Health certificate shown as a document icon with label ("Health Certificate on file") — NO download URL returned pre-inquiry.
3. Contact details (phone/email) NOT in response.
4. Page includes: "Submit Inquiry to Access Contact & Documents" CTA button (visible to logged-in buyers; prompts login for unauthenticated users).
5. Cynology achievements section: list of achievement records (title, federation, year) from breeder profile.
6. Reviews section: last 5 reviews (stars + text excerpt), link to full breeder profile for all reviews.
7. Breadcrumb navigation: Home → Search Results → [Listing Title].
8. Can be verified locally: create listing, fetch detail, confirm no contact/document URLs in response.

