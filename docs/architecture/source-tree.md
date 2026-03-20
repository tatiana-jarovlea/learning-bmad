# Source Tree — PawTrust

[Source: architecture.md §10, §11, §12]

Polyrepo: two separate Git repositories under `pawtrust-org` GitHub organization.

---

## pawtrust-frontend (React 18 SPA)

```
pawtrust-frontend/
├── public/
│   └── locales/
│       ├── ro/translation.json
│       └── ru/translation.json
├── src/
│   ├── api/
│   │   ├── axiosClient.ts        # Axios instance, baseURL, auth interceptor, 401 handler
│   │   ├── auth.api.ts
│   │   ├── listings.api.ts
│   │   ├── inquiries.api.ts
│   │   ├── sitters.api.ts
│   │   └── payments.api.ts
│   ├── components/
│   │   ├── common/               # Button, Badge, Modal, Spinner, Toast, ErrorBoundary
│   │   ├── listings/             # ListingCard, ListingGrid, InquiryForm, PhotoGallery
│   │   ├── breeders/             # BreederCard, VerifiedBadge, DocumentUpload
│   │   ├── sitters/              # SitterCard, ServicesList
│   │   └── layout/               # Header, Footer, NavBar, LocaleSwitcher
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Search.tsx
│   │   ├── ListingDetail.tsx
│   │   ├── BreederProfile.tsx
│   │   ├── SitterProfile.tsx
│   │   ├── BuyerDashboard.tsx
│   │   ├── BreederDashboard.tsx
│   │   ├── SitterDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── auth/
│   │   │   ├── Register.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── PaymentSuccess.tsx
│   │   └── PaymentCancel.tsx
│   ├── hooks/                    # useAuth, useListings, useInquiries, useSitters
│   ├── store/                    # Zustand auth store (persisted to localStorage)
│   ├── types/                    # Shared TypeScript interfaces (Listing, User, Inquiry, etc.)
│   ├── utils/                    # Formatters, validators, date helpers
│   ├── i18n.ts                   # i18next initialization
│   ├── router.tsx                # React Router v6 route definitions + ProtectedRoute
│   └── main.tsx                  # App entry point, QueryClient provider, i18n init
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## pawtrust-backend (Laravel 11 API)

```
pawtrust-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/V1/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ListingController.php
│   │   │   │   ├── BreederProfileController.php
│   │   │   │   ├── BreederDocumentController.php
│   │   │   │   ├── SitterProfileController.php
│   │   │   │   ├── VerificationRequestController.php
│   │   │   │   ├── InquiryController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── AdminVerificationController.php
│   │   │   │       └── AdminUserController.php
│   │   │   └── WebhookController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureRole.php          # Role gate (breeder, buyer, sitter, admin)
│   │   │   └── SetLocale.php           # Accept-Language → app locale
│   │   └── Requests/                   # FormRequest validation classes (one per action)
│   ├── Models/
│   │   ├── User.php
│   │   ├── BreederProfile.php
│   │   ├── Listing.php
│   │   ├── ListingPhoto.php
│   │   ├── BreederDocument.php
│   │   ├── SitterProfile.php
│   │   ├── SitterPhoto.php
│   │   ├── VerificationRequest.php
│   │   ├── Inquiry.php
│   │   ├── Review.php
│   │   └── Payment.php
│   ├── Services/
│   │   ├── ListingService.php
│   │   ├── BreederService.php
│   │   ├── SitterService.php
│   │   ├── VerificationService.php
│   │   ├── InquiryService.php
│   │   ├── PaymentService.php
│   │   └── S3Service.php               # Pre-signed URL generation
│   ├── Jobs/
│   │   ├── SendInquiryReceivedEmail.php
│   │   ├── SendInquiryStatusEmail.php
│   │   ├── SendVerificationStatusEmail.php
│   │   └── SendPaymentConfirmationEmail.php
│   ├── Mail/
│   │   ├── InquiryReceived.php
│   │   ├── InquiryAccepted.php
│   │   ├── InquiryRejected.php
│   │   ├── VerificationApproved.php
│   │   ├── VerificationRejected.php
│   │   └── PaymentConfirmation.php
│   ├── Policies/
│   │   ├── ListingPolicy.php           # Owner-only update/delete
│   │   ├── InquiryPolicy.php           # Contact reveal + document access gate
│   │   └── BreederDocumentPolicy.php
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── migrations/                     # See database-schema.md for order
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── AdminUserSeeder.php
├── routes/
│   ├── api.php                         # All /api/v1/* routes
│   └── web.php                         # Stripe webhook (CSRF excluded)
├── config/
│   ├── sanctum.php
│   └── filesystems.php                 # S3 disk configuration
├── tests/
│   ├── Unit/Services/
│   └── Feature/
│       ├── Auth/
│       ├── Listings/
│       ├── Inquiries/
│       ├── Verification/
│       └── Payments/
├── .env.example
├── docker-compose.yml
└── composer.json
```

---

## GitHub Actions Workflows

### pawtrust-frontend

```
.github/workflows/
├── ci.yml       # Lint + type-check + test on every PR
└── deploy.yml   # Build → S3 sync → CloudFront invalidation on merge to main
```

### pawtrust-backend

```
.github/workflows/
├── ci.yml       # PHP CS Fixer + PHPUnit on every PR
└── deploy.yml   # Composer install → EB deploy on merge to main
```

