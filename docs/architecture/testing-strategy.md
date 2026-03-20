# Testing Strategy — PawTrust

[Source: architecture.md §16]

---

## Backend (PHPUnit)

**Coverage target:** 80% line coverage on Service classes; 100% on auth + payment flows.

### Unit Tests — Service and Model logic in isolation (no DB, no HTTP)

```
tests/Unit/Services/InquiryServiceTest.php      # Contact reveal gating logic
tests/Unit/Services/PaymentServiceTest.php      # Stripe session creation
tests/Unit/Models/ListingTest.php               # Scopes, casts, relationships
```

### Feature Tests — Full HTTP request lifecycle with test DB (`RefreshDatabase`)

```
tests/Feature/Auth/RegisterTest.php             # Registration + email verify
tests/Feature/Auth/LoginTest.php                # JWT + rate limiting
tests/Feature/Listings/CreateListingTest.php    # Auth + validation + DB
tests/Feature/Listings/SearchListingsTest.php   # Filters + pagination
tests/Feature/Inquiries/ContactRevealTest.php   # Gate: accepted inquiries only
tests/Feature/Payments/StripeWebhookTest.php    # Signature + listing activation
tests/Feature/Admin/VerificationTest.php        # Admin approve/reject
```

### Running tests

```bash
# Run all tests
php artisan test

# Run specific suite
php artisan test --filter=ContactRevealTest

# With coverage
php artisan test --coverage --min=80
```

---

## Frontend (Jest + React Testing Library)

### Component Tests

```
src/components/listings/ListingCard.test.tsx    # Renders price, VerifiedBadge
src/components/common/VerifiedBadge.test.tsx    # Conditional display (verified vs unverified)
src/pages/ListingDetail.test.tsx                # Inquiry form gating (guest vs authenticated)
```

### Integration Tests (mock Axios via MSW or jest.mock)

```
src/pages/BuyerDashboard.test.tsx               # Contact reveal button state
src/pages/BreederDashboard.test.tsx             # Inquiry accept/reject flow
src/pages/auth/Register.test.tsx                # Form validation + role selection
```

### Running tests

```bash
npm run test            # Watch mode
npm run test:ci         # Single run (CI)
npm run test:coverage   # Coverage report
```

---

## Critical Manual Test Cases (Pre-Launch)

| Scenario                                                           | Expected |
| ------------------------------------------------------------------ | -------- |
| Buyer submits inquiry → breeder receives notification email        | ✅ Pass  |
| Breeder accepts → buyer email sent + contact revealed in dashboard | ✅ Pass  |
| Unaccepted inquiry → `GET /inquiries/{id}/contact` returns 403     | ✅ Pass  |
| Stripe payment completed → webhook → listing activated             | ✅ Pass  |
| Document upload → admin pre-signed URL accessible (15 min)         | ✅ Pass  |
| Unauthenticated user → admin route returns 401                     | ✅ Pass  |
| Non-owner → update listing returns 403                             | ✅ Pass  |
| Contact details absent from listing API response                   | ✅ Pass  |
| Featured listing appears before standard in search results         | ✅ Pass  |

---

## No E2E Tests at MVP

Manual smoke testing covers critical user journeys. E2E (Playwright/Cypress) deferred to post-MVP. See `docs/smoke-tests.md` (created in Epic 6.5) for smoke test script.

