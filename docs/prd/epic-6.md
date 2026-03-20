# Epic 6: i18n, Polish & Launch Readiness

**Goal:** Platform is fully bilingual (Romanian + Russian), GDPR-compliant, performant, security-hardened, and passes a smoke test suite. Ready for Moldova production launch.

---

## Story 6.1 — Full Romanian + Russian Internationalization

_As a user in Moldova or Romania, I want the entire platform interface in my preferred language so that I can use the platform comfortably._

**Acceptance Criteria:**

1. All user-facing UI strings (labels, buttons, error messages, empty states, email subjects/bodies) available in both Romanian (`ro`) and Russian (`ru`). No English visible to end users in production.
2. Frontend: React i18next with locale files `public/locales/ro/translation.json` and `public/locales/ru/translation.json`. Language stored in localStorage. Default: browser locale detection (`ro` preferred, fallback `ru`, then `ro`).
3. Backend: Laravel localization files `lang/ro/` and `lang/ru/` for all API validation messages and email templates.
4. Language toggle (RO / RU) in navigation bar — switches all UI text instantly without page reload.
5. All transactional emails sent in user's preferred language (stored on user record as `language` field, defaults to `ro`).
6. Date formats localized: Romanian format (DD.MM.YYYY), Russian format (DD.MM.YYYY — same in this region).
7. Currency displayed as EUR throughout (no localization needed).
8. QA: full manual walkthrough of all 10 core screens in both languages before launch sign-off.

---

## Story 6.2 — GDPR Compliance

_As a user, I want to know how my data is used and have control over it so that I can use PawTrust with confidence in my privacy rights._

**Acceptance Criteria:**

1. Privacy Policy page (`/privacy`) — written in Romanian and Russian. Covers: data collected, how it's used, third-party processors (AWS, Stripe, SES), user rights, contact for data requests.
2. Cookie consent banner on first visit: "Accept all" / "Reject non-essential" (informational at MVP — no third-party tracking at launch). Consent stored in localStorage.
3. Account deletion: `DELETE /api/account` endpoint — soft-deletes user record (sets `deleted_at`), anonymizes personal data (name → "Deleted User", email → `deleted_{id}@pawtrust.md`), revokes all tokens, removes all S3 documents for that user within 30 days (background job). Returns 200.
4. Data export: `GET /api/account/export` — returns JSON of all user-owned data (profile, listings, inquiries, reviews). Intended for manual fulfillment of data subject access requests.
5. Terms of Service page (`/terms`) — linked in footer, in both languages.
6. All forms include privacy notice: "By registering, you agree to our [Privacy Policy] and [Terms of Service]."
7. Footer links: Privacy Policy, Terms of Service, Contact Us (email address).

---

## Story 6.3 — Performance & SEO Foundations

_As PawTrust, I want the platform to load fast and be discoverable on search engines so that we can grow organically._

**Acceptance Criteria:**

1. All listing and breeder profile pages have: unique `<title>` tags, `<meta name="description">`, Open Graph tags (og:title, og:description, og:image) populated with listing/breeder data.
2. Homepage and key landing pages have structured data (JSON-LD for Organization schema).
3. React app uses React Helmet (or equivalent) for dynamic head management.
4. Images: WebP format served via CloudFront. Lazy loading on all listing grid images. Main listing photo (LCP candidate) eagerly loaded.
5. Lighthouse audit on listing detail and search results pages: Performance ≥ 80, LCP < 3s on simulated 4G mobile. Run audit and document results before launch sign-off.
6. `sitemap.xml` generated and submitted (manual or script — auto-generation is post-MVP). At minimum, static routes included.
7. `robots.txt` configured: allow all crawlers for public pages; disallow `/api/`, `/admin/`, `/dashboard/`.

---

## Story 6.4 — Security Hardening

_As PawTrust, I want the platform to be hardened against common attacks so that user data and the platform are protected at launch._

**Acceptance Criteria:**

1. All API endpoints validated for auth (no unintentionally public endpoints).
2. SQL injection prevention: all database queries use Laravel Eloquent ORM or Query Builder with parameterized queries. Raw SQL queries audited (grep for `DB::statement`, `DB::unprepared`).
3. XSS prevention: all user-generated content HTML-escaped on output. React JSX auto-escapes strings.
4. CSRF protection: Laravel CSRF middleware active on all non-API routes. API routes use Sanctum token auth (stateless, no CSRF needed).
5. HTTPS enforced: HTTP requests redirected to HTTPS at load balancer / web server level.
6. Security headers set on all responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (baseline).
7. S3 bucket policy: no public read access on document/photo buckets. Only pre-signed URL access allowed.
8. Stripe webhook signature verification active (confirm enabled in production config).
9. Rate limiting verified on: login endpoint (10/min/IP), inquiry submission (5/hour/IP), sitter contact form (5/hour/IP).
10. Dependency audit: `composer audit` and `npm audit` run. No critical or high severity CVEs unaddressed.

---

## Story 6.5 — Smoke Testing & Production Deploy

_As PawTrust, I want a suite of smoke tests and a validated production deployment so that we can launch with confidence._

**Acceptance Criteria:**

1. Smoke test script documented in `docs/smoke-tests.md` — covers the critical user paths:
   1. Register as Buyer → Login → Browse listings → Submit inquiry → Receive contact details
   2. Register as Breeder → Create listing → Pay via Stripe test mode → Listing appears in search
   3. Submit verification documents → Admin approves → Verified badge appears on listing
   4. Register as Pet Sitter → Create profile → Profile appears on sitter discovery page
   5. Admin login → Access admin dashboard → No access as non-admin (confirm 403)
2. All smoke tests pass on staging environment before production deploy.
3. Production environment provisioned (separate from staging): EC2/EB, RDS, S3 (prod buckets), CloudFront, SES with production domain, Stripe live keys.
4. Database migrations run successfully on production RDS. Admin user seeded.
5. DNS configured: primary domain points to CloudFront (frontend) and API subdomain points to production API.
6. Post-deploy checklist completed: HTTPS working, emails flowing (test email sent via SES production), Stripe live mode active, smoke tests passing on production.
7. Rollback plan documented: if critical issue found post-deploy, steps to revert to previous build.

