# Epic 5: Pet Sitter Profiles & Pay-per-Listing

**Goal:** Pet sitters can create a discoverable profile. Buyers can find sitters by location. Stripe pay-per-listing is live for breeders (standard €3 / featured €8). Breeders can upgrade to featured listings.

---

## Story 5.1 — Pet Sitter Profile Creation & Management

_As a pet sitter, I want to create a profile that showcases my services so that pet owners can find and contact me._

**Acceptance Criteria:**

1. Pet Sitter profile fields: full name, bio (max 500 chars), service area (city/region, up to 3 areas), services offered (checkboxes: boarding, dog walking, day care, drop-in visits), rates (text field, e.g., "€15/night boarding"), experience (years), languages spoken, care portfolio (photo upload, max 6 photos, S3 stored, CloudFront served).
2. Profile creation/update: `POST /api/sitter/profile`, `PUT /api/sitter/profile`. Auth required, pet_sitter role only.
3. Public sitter profile at `/sitters/{id}`: returns all fields above (no contact details). Contact form button is CTA.
4. Contact form on sitter profile: `POST /api/sitters/{id}/contact` — sends name + email + message to sitter via AWS SES. No contact details exposed in response. Rate-limited: 5 submissions per IP per hour.
5. SitterDashboard shell: profile editor + contact submissions received (list of name, date, message).
6. Profile completeness prompt if required fields missing.

---

## Story 5.2 — Pet Sitter Discovery Page

_As a buyer or pet owner, I want to browse pet sitters by location so that I can find care for my pet locally._

**Acceptance Criteria:**

1. Public endpoint `GET /api/sitters` — returns paginated list of sitter cards: name, service area, services offered (icon list), rates, profile photo, bio excerpt, average review (show "-" for now — reviews in v2).
2. Filter by: service area (city/region), service type (boarding/walking/daycare/drop-in).
3. Default sort: most recently updated profile first.
4. No auth required for browsing sitter discovery page.
5. Frontend: `/sitters` route with filter sidebar, responsive grid of sitter cards, each card links to `/sitters/{id}`.
6. Empty state: "No sitters found in [location]. Try expanding your area."

---

## Story 5.3 — Stripe Pay-per-Listing Integration

_As a breeder, I want to pay for my listing via Stripe so that my listing goes live and is visible to buyers._

**Acceptance Criteria:**

1. When creating a listing (Story 2.2) with `SKIP_LISTING_PAYMENT=false` (production mode), listing is saved with status `pending_payment`.
2. Payment initiation: `POST /api/listings/{id}/payment/initiate` returns a Stripe Checkout Session URL. Auth required, breeder role, must own the listing.
3. Stripe Checkout configured: standard listing €3.00 EUR, featured listing €8.00 EUR. PCI-compliant (hosted Stripe Checkout page — no raw card data on PawTrust servers).
4. Stripe webhook endpoint: `POST /api/webhooks/stripe` — handles `checkout.session.completed` event. On success: sets listing status to `active`, sets `listed_at` timestamp. Webhook signature verified using `STRIPE_WEBHOOK_SECRET`.
5. On payment success: listing immediately appears in search results.
6. On payment failure or abandonment: listing remains in `pending_payment` status. Breeder can retry payment from BreederDashboard.
7. BreederDashboard listing manager shows listing status and "Complete Payment" CTA for pending_payment listings.
8. Test mode: Stripe test keys (`STRIPE_KEY`, `STRIPE_SECRET` env vars) used in local/staging. Production keys used in prod.
9. Can be verified locally: use Stripe test card, complete checkout, verify webhook fires, listing status changes to `active`.

---

## Story 5.4 — Featured Listing Upgrade

_As a breeder with an active listing, I want to upgrade to a featured listing so that my listing appears at the top of search results._

**Acceptance Criteria:**

1. Active listings (status = `active`) can be upgraded to featured via: `POST /api/listings/{id}/upgrade-to-featured`. Auth required, breeder role, must own the listing. Listing must not already be featured.
2. Initiates a Stripe Checkout Session for the upgrade price: featured price (€8) minus standard price already paid (€3) = €5 upgrade fee. If listing was originally created as standard, charge €5. If originally created as featured (already paid €8), upgrade endpoint returns 400 "Listing is already featured."
3. On payment success (Stripe webhook): listing `featured` boolean set to `true`. Listing moves to top of default sort in search results.
4. Featured badge displayed on listing cards in search results: "Featured" label (visually distinct from Verified badge).
5. Featured status lasts for the remainder of the listing's 30-day active period (no separate featured expiry).
6. BreederDashboard: "Upgrade to Featured (€5)" CTA on active standard listings.

