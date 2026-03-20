# Epic 3: Verification System

**Goal:** Breeders can submit their credentials for admin review. Admins can review, approve, or reject submissions via a dedicated dashboard. Verified breeders receive a badge visible on all their listings and profile. All status changes trigger email notifications.

---

## Story 3.1 — Breeder Verification Request Submission

_As a breeder, I want to submit a verification request so that I can earn a Verified badge and build buyer trust._

**Acceptance Criteria:**

1. Verification request submitted via `POST /api/verification/submit`. Auth required, breeder role only.
2. Request requires: at least 1 document uploaded (Story 2.3) to be associated. Breeders select which documents to include in the submission.
3. Submission creates a verification record with status `pending`. Breeders cannot submit a new request while one is `pending` or `under_review`.
4. Breeder dashboard shows current verification status: `Not Submitted`, `Pending Review`, `Under Review`, `Verified`, `Rejected (with admin notes)`.
5. On rejection, admin notes are visible to the breeder in the dashboard. Breeder can resubmit (creates new verification record, does not overwrite history).
6. Rejected breeders retain `Unverified` label (not blocked from listing).
7. Verification submission history stored (each submission as separate record for audit trail).

---

## Story 3.2 — Admin Verification Review Dashboard

_As an admin, I want to review breeder verification submissions so that I can approve or reject credentials and maintain platform trust._

**Acceptance Criteria:**

1. Admin dashboard route `/admin/verification` lists all submissions with status filter (pending, under_review, approved, rejected). Paginated (20 per page).
2. Each submission shows: breeder name, kennel name, submission date, document list with view links, current status.
3. Admin can click to view individual documents via time-limited pre-signed S3 URLs (generated server-side on demand, TTL 15 minutes). URL generation endpoint: `GET /api/admin/documents/{id}/preview`. Admin role required.
4. Admin can: set status to `under_review` (locks resubmission), `approved` (triggers Verified badge), `rejected` (requires notes field, min 20 chars).
5. Status update endpoint: `POST /api/admin/verification/{id}/review` — body: `{ status, notes }`. Admin role required.
6. On approval: breeder's `verified` flag set to `true` in database. Reflected immediately on public profile and all listings.
7. On rejection: breeder's `verified` flag remains `false`. Rejection notes stored and visible to breeder.
8. All admin actions logged with timestamp and admin user ID (audit log table).

---

## Story 3.3 — Verified/Unverified Badge Display

_As a buyer, I want to clearly see whether a breeder is verified on listing cards and profiles so that I can make an informed trust decision quickly._

**Acceptance Criteria:**

1. Verified breeders: green checkmark + "Verified" label displayed on listing card (search results), listing detail page, and breeder public profile.
2. Unverified breeders: grey "Unverified" label displayed in same positions — not hidden, not visually alarming, but clearly differentiated.
3. Badge state driven by `verified` boolean on breeder record — updated in real time by admin actions (Story 3.2).
4. Tooltip on badge: Verified = "Documents reviewed and approved by PawTrust team"; Unverified = "This breeder has not yet submitted verification documents."
5. Badge visible without scrolling on listing cards (above the fold on mobile).
6. Filter "Verified breeders only" on search results works correctly (Story 2.4 `?verified_only=true`).

---

## Story 3.4 — Verification Status Email Notifications

_As a breeder, I want to receive email notifications when my verification status changes so that I know when to take action._

**Acceptance Criteria:**

1. On verification submission received: email sent to admin team address (configurable via `ADMIN_NOTIFICATION_EMAIL` env var) — subject: "New verification submission from [Kennel Name]".
2. On status change to `under_review`: email sent to breeder — "Your verification is under review."
3. On status change to `approved`: email sent to breeder — "Congratulations! You are now Verified on PawTrust." Includes link to their public profile.
4. On status change to `rejected`: email sent to breeder — includes admin rejection notes and CTA to update documents and resubmit.
5. All emails sent via Laravel Queue (async) → AWS SES. Emails do not block API response.
6. Emails available in both Romanian and Russian based on user's registered language preference.
7. Can be verified locally using Laravel's `log` mail driver (emails appear in `storage/logs/`).

