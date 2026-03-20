# Epic 4: Inquiry System & Contact Reveal

**Goal:** Buyers can express interest in a listing. The breeder is notified. The buyer gains access to the breeder's contact details and listing documents after submitting an inquiry. Buyers can leave reviews. Buyers have a dashboard to track their activity.

---

## Story 4.1 — Inquiry Submission

_As a buyer, I want to submit an inquiry on a listing so that I can contact the breeder and access their documents._

**Acceptance Criteria:**

1. Inquiry submission endpoint: `POST /api/listings/{id}/inquire`. Auth required, buyer role only. Breeders cannot inquire on listings.
2. Request body: optional message (max 500 chars).
3. Creates an inquiry record: listing_id, buyer_id, message, status (`pending`), `created_at`.
4. One inquiry per buyer per listing enforced — duplicate inquiry returns 409 with message "You have already inquired about this listing."
5. On successful inquiry: response includes `{ inquiry_id, breeder_contact: { phone, email, name } }` — this is the ONLY API endpoint that returns breeder contact details.
6. Inquiry status set to `contact_revealed` automatically upon successful submission (no additional step required from buyer or breeder).
7. Can be verified locally: create listing, submit inquiry, verify contact details returned, verify a second inquiry attempt returns 409.

---

## Story 4.2 — Breeder Notification on New Inquiry

_As a breeder, I want to be notified when a buyer submits an inquiry so that I can respond promptly._

**Acceptance Criteria:**

1. On inquiry submission (Story 4.1): email sent to breeder immediately (via Laravel Queue → AWS SES).
2. Email contains: buyer's name, optional message, listing title, link to the listing in BreederDashboard.
3. Email available in both Romanian and Russian based on breeder's language preference.
4. New inquiry count shown as a badge/counter in the BreederDashboard navigation (unread count).
5. BreederDashboard inquiry list: shows each inquiry with buyer name, date, listing title, message excerpt, status.
6. Can be verified locally: submit inquiry, check mail log for breeder notification email.

---

## Story 4.3 — Post-Inquiry Document Access

_As a buyer who has submitted an inquiry, I want to access the listing's health documents so that I can review the pet's medical history._

**Acceptance Criteria:**

1. After inquiry submission, buyer can access listing documents via `GET /api/inquiries/{inquiry_id}/documents`.
2. Auth required. Requesting user must be the buyer who submitted the inquiry (enforced server-side).
3. Response: list of documents `{ id, type, filename }` with time-limited pre-signed S3 URLs (TTL 1 hour) for download.
4. Non-authorized users (other buyers, unauthenticated) receive 403.
5. Documents accessible as long as the inquiry exists (no expiry on document access post-inquiry).
6. Frontend: "View Documents" button appears on inquiry card in BuyerDashboard after inquiry is submitted. Clicking generates and opens document URLs.

---

## Story 4.4 — Review Submission

_As a buyer, I want to leave a review for a breeder after a transaction so that I can help other buyers make informed decisions._

**Acceptance Criteria:**

1. Review submission endpoint: `POST /api/breeders/{id}/reviews`. Auth required, buyer role only.
2. Request body: `{ rating: 1-5, text: string (max 500 chars) }`.
3. One review per buyer per breeder enforced — duplicate returns 409.
4. Review is immediately visible on the breeder's public profile (no moderation queue at MVP — admin can delete via admin dashboard if reported).
5. Reviews displayed on public breeder profile: star rating, text, buyer first name + last initial, date.
6. Breeder profile shows aggregate: average rating (1 decimal place) + total review count.
7. BuyerDashboard: "Leave a Review" CTA appears for breeders the buyer has an approved inquiry with. If review already submitted, shows "Review Submitted" (no edit at MVP).

---

## Story 4.5 — Buyer Dashboard

_As a buyer, I want a dashboard where I can track my inquiries and reviews so that I can manage my activity on PawTrust._

**Acceptance Criteria:**

1. BuyerDashboard route: `/dashboard/buyer` — auth required, buyer role only.
2. **My Inquiries** section: list of all inquiries submitted by the buyer. Each inquiry card shows: listing photo, breed/title, breeder name, date submitted, status, "View Contact Details" button (always available post-submission) and "View Documents" button (triggers Story 4.3).
3. **My Reviews** section: list of reviews submitted by the buyer (breeder name, rating, date, text excerpt).
4. **Saved Listings** section: list of listings the buyer has bookmarked (heart icon on listing cards adds to saved list; `POST /api/listings/{id}/save` and `DELETE /api/listings/{id}/save`). Saved listings persist across sessions.
5. Empty states for each section with helpful CTA (e.g., "Browse listings to find your next pet").
6. BuyerDashboard is the landing page for buyers after login.

