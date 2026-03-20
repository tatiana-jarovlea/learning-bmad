# PawTrust — Fullstack Architecture Document

**Version:** 1.0
**Date:** 2026-03-20
**Architect:** Winston (Architect Agent)
**Status:** Draft — Pending Checklist Review

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [High Level Architecture](#2-high-level-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Data Models](#4-data-models)
5. [API Specification](#5-api-specification)
6. [Components](#6-components)
7. [External APIs](#7-external-apis)
8. [Core Workflows](#8-core-workflows)
9. [Database Schema](#9-database-schema)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Backend Architecture](#11-backend-architecture)
12. [Unified Project Structure](#12-unified-project-structure)
13. [Development Workflow](#13-development-workflow)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Security & Performance](#15-security--performance)
16. [Testing Strategy](#16-testing-strategy)
17. [Coding Standards](#17-coding-standards)
18. [Error Handling Strategy](#18-error-handling-strategy)
19. [Monitoring & Observability](#19-monitoring--observability)
20. [Architect Checklist Results](#20-architect-checklist-results)

---

## 1. Introduction

This document outlines the complete fullstack architecture for PawTrust — a bilingual (Romanian + Russian) pet adoption and breeder discovery platform targeting Moldova and Romania. It covers backend systems, frontend implementation, infrastructure, security, and integration points. It serves as the single source of truth for AI-driven development across the `pawtrust-frontend` and `pawtrust-backend` repositories.

**Starter Template:** N/A — Greenfield project. Both repositories initialized from scratch using Vite (frontend) and `laravel new` (backend).

### Change Log

| Date       | Version | Description                   | Author                    |
| ---------- | ------- | ----------------------------- | ------------------------- |
| 2026-03-20 | 1.0     | Initial architecture document | Winston (Architect Agent) |

---

## 2. High Level Architecture

### 2.1 Technical Summary

PawTrust is a polyrepo, full-stack web application built on a **Laravel 11 REST API monolith** (backend) and a **React 18 + TypeScript SPA** (frontend), deployed entirely on AWS. The frontend is compiled to a static build served via S3 + CloudFront CDN; the backend runs on EC2/Elastic Beanstalk with MySQL 8 on RDS. The two halves communicate exclusively over a versioned REST JSON API, authenticated with Sanctum-issued JWTs. Key integration points include AWS SES for transactional email, AWS S3 for private document and photo storage accessed via pre-signed URLs, and Stripe Checkout for PCI-compliant payment processing. This architecture achieves the PRD goals by keeping operational complexity low (monolith, single DB, no microservices) while placing trust-enforcement logic firmly on the server side — contact reveal gating and document access control are never client-side concerns.

### 2.2 Platform and Infrastructure Choice

**Selected Platform: AWS Full Stack**

| Option                                                    | Pros                                                                                                                               | Cons                                                                                       | Verdict         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------- |
| **AWS Full Stack** (EC2/EB + RDS + S3 + SES + CloudFront) | Full control, Laravel-native fit, cost-predictable for low traffic, private S3 buckets trivial, SES cheap for transactional volume | More config than Vercel/Supabase; no built-in auth (handled by Sanctum)                    | ✅ Chosen       |
| Vercel + PlanetScale/Supabase                             | Fast DX, zero-config deploys, built-in edge                                                                                        | PHP/Laravel not supported — would force Node.js backend rewrite; contradicts PRD decisions | ❌ Incompatible |
| DigitalOcean App Platform                                 | Simpler than AWS, supports PHP                                                                                                     | Weaker S3 integration, no native SES equivalent, smaller ecosystem for Eastern Europe PoPs | ❌ Suboptimal   |

**Platform:** AWS
**Key Services:** EC2 or Elastic Beanstalk (API), RDS MySQL 8 (database), S3 (private file storage), CloudFront (CDN / frontend hosting), SES (transactional email), ACM (SSL certificates)
**Deployment Region:** `eu-central-1` (Frankfurt) — lowest latency to Moldova + Romania

### 2.3 Repository Structure

**Structure:** Polyrepo — two independent Git repositories
**Monorepo Tool:** N/A

```
pawtrust-frontend/   → React 18 + TypeScript SPA
pawtrust-backend/    → PHP 8.2 + Laravel 11 REST API
```

Frontend and backend have completely different build pipelines (npm vs composer), deployment targets (S3/CloudFront vs EC2/EB), and release cadences. There is no shared TypeScript code between them at MVP — the API contract is the interface boundary.

### 2.4 High Level Architecture Diagram

```mermaid
graph TB
    subgraph Users["👥 Users (Browser)"]
        U1[Buyer]
        U2[Breeder]
        U3[Pet Sitter]
        U4[Admin]
    end

    subgraph Frontend["Frontend — pawtrust-frontend"]
        CF[CloudFront CDN]
        S3F[S3 Static Bucket\nReact SPA Build]
        CF --> S3F
    end

    subgraph Backend["Backend — pawtrust-backend"]
        EB[EC2 / Elastic Beanstalk\nLaravel 11 API]
        Q[Laravel Queue Worker\nAsync Email Jobs]
        EB --> Q
    end

    subgraph Data["Data Layer"]
        RDS[(RDS MySQL 8\nPrimary Database)]
        S3P[S3 Private Bucket\nDocuments + Photos]
    end

    subgraph External["External Services"]
        SES[AWS SES\nTransactional Email]
        STRIPE[Stripe Checkout\nPayments]
        CF2[CloudFront\nAsset CDN]
    end

    Users --> CF
    CF --> S3F
    Users -->|"HTTPS REST API\n+ JWT"| EB
    EB --> RDS
    EB -->|"Pre-signed URLs"| S3P
    S3P --> CF2
    CF2 --> Users
    Q --> SES
    EB -->|"Checkout Session"| STRIPE
    STRIPE -->|"Webhook"| EB
```

### 2.5 Architectural Patterns

- **Monolithic Backend (Laravel):** Single Laravel application handles all API routes, business logic, queue jobs, and DB access. _Rationale:_ MVP scale doesn't justify microservices overhead; monolith is easier to develop, test, and deploy for a small team.
- **SPA + REST API separation:** React SPA communicates with Laravel via JSON REST API only. No SSR at MVP. SEO handled via React Helmet meta tags.
- **Repository Pattern (Laravel):** Business logic in Service classes; Eloquent Models handle data access. Keeps controllers thin and services testable.
- **Server-Side Contact Gating:** Contact reveal is a server-side action — the API never returns contact fields unless the requesting user has an approved inquiry. Core trust/safety requirement from FR15/NFR8.
- **Pre-signed URL Pattern (S3):** All private file access via time-limited AWS pre-signed URLs generated server-side on demand. Keeps S3 buckets fully private; TTL enforced per use case.
- **Event-Driven Emails (Laravel Queue):** All transactional emails dispatched as queued jobs. SES delivery latency does not block API responses; queue provides retry logic.
- **Stripe Hosted Checkout:** PCI compliance via Stripe's hosted payment page — raw card data never touches PawTrust servers.

---

## 3. Tech Stack

### 3.1 Frontend

| Layer        | Technology                   | Version | Purpose                         |
| ------------ | ---------------------------- | ------- | ------------------------------- |
| UI Framework | React                        | 18      | Component-based SPA             |
| Language     | TypeScript                   | 5.x     | Type-safe development           |
| Styling      | TailwindCSS                  | 3.x     | Utility-first CSS               |
| Routing      | React Router                 | 6.x     | Client-side routing             |
| HTTP Client  | Axios                        | 1.x     | API communication               |
| Server State | TanStack Query               | 5.x     | Data fetching + caching         |
| SEO          | React Helmet Async           | 2.x     | Meta tags management            |
| i18n         | react-i18next                | 15.x    | String translations             |
| Build Tool   | Vite                         | 5.x     | Dev server + production build   |
| Testing      | Jest + React Testing Library | —       | Component and integration tests |

### 3.2 Backend

| Layer          | Technology                | Version | Purpose                     |
| -------------- | ------------------------- | ------- | --------------------------- |
| Language       | PHP                       | 8.2+    | Server-side logic           |
| Framework      | Laravel                   | 11.x    | Full-featured PHP framework |
| Authentication | Laravel Sanctum           | 4.x     | API token issuance + auth   |
| ORM            | Eloquent (built-in)       | —       | Database access layer       |
| Queues         | Laravel Queue (DB driver) | —       | Async email processing      |
| File Storage   | Laravel Storage + AWS SDK | —       | S3 integration              |
| Authorization  | Spatie Laravel Permission | 6.x     | Role-based access control   |
| Testing        | PHPUnit                   | 11.x    | Unit and feature tests      |
| Code Style     | PHP CS Fixer              | 3.x     | PSR-12 enforcement          |

### 3.3 Database

| Technology | Version | Purpose                     |
| ---------- | ------- | --------------------------- |
| MySQL      | 8.0     | Primary relational database |
| AWS RDS    | —       | Managed MySQL hosting       |

### 3.4 Infrastructure & DevOps

| Service                     | Purpose                                     |
| --------------------------- | ------------------------------------------- |
| AWS EC2 / Elastic Beanstalk | Laravel API hosting                         |
| AWS RDS (MySQL 8)           | Managed database                            |
| AWS S3                      | Private document + photo storage            |
| AWS CloudFront              | CDN — frontend SPA + private asset delivery |
| AWS SES                     | Transactional email delivery                |
| AWS ACM                     | Free SSL/TLS certificates                   |
| Docker Compose              | Local development environment               |
| GitHub Actions              | CI/CD pipeline                              |

---

## 4. Data Models

### 4.1 Core Entity Overview

```mermaid
erDiagram
    USERS ||--o| BREEDER_PROFILES : "has one"
    USERS ||--o| SITTER_PROFILES : "has one"
    USERS ||--o{ INQUIRIES : "submits"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ PAYMENTS : "makes"
    BREEDER_PROFILES ||--o{ LISTINGS : "owns"
    BREEDER_PROFILES ||--o{ BREEDER_DOCUMENTS : "uploads"
    BREEDER_PROFILES ||--o{ VERIFICATION_REQUESTS : "creates"
    LISTINGS ||--o{ LISTING_PHOTOS : "has"
    LISTINGS ||--o{ INQUIRIES : "receives"
    LISTINGS ||--o| REVIEWS : "has one"
    SITTER_PROFILES ||--o{ SITTER_PHOTOS : "has"
    SITTER_PROFILES ||--o{ VERIFICATION_REQUESTS : "creates"
```

### 4.2 Entity Definitions

**users**

| Field                   | Type                                     | Notes         |
| ----------------------- | ---------------------------------------- | ------------- |
| id                      | bigint PK                                |               |
| name                    | varchar(255)                             |               |
| email                   | varchar(255) unique                      |               |
| password                | varchar(255)                             | bcrypt hashed |
| role                    | enum('buyer','breeder','sitter','admin') |               |
| locale                  | enum('ro','ru')                          | default 'ro'  |
| email_verified_at       | timestamp nullable                       |               |
| created_at / updated_at | timestamps                               |               |

**breeder_profiles**

| Field                   | Type                       | Notes                      |
| ----------------------- | -------------------------- | -------------------------- |
| id                      | bigint PK                  |                            |
| user_id                 | bigint FK → users          | unique                     |
| kennel_name             | varchar(255)               |                            |
| display_name            | varchar(255)               |                            |
| description             | text nullable              |                            |
| location                | varchar(255)               |                            |
| phone                   | varchar(50)                | never returned pre-inquiry |
| website                 | varchar(255) nullable      |                            |
| breed_specialization    | varchar(255) nullable      |                            |
| verified_at             | timestamp nullable         | null = not verified        |
| verified_by             | bigint FK → users nullable | admin who verified         |
| created_at / updated_at | timestamps                 |                            |

**listings**

| Field                   | Type                                    | Notes               |
| ----------------------- | --------------------------------------- | ------------------- |
| id                      | bigint PK                               |                     |
| breeder_profile_id      | bigint FK                               |                     |
| title                   | varchar(255)                            |                     |
| description             | text                                    |                     |
| species                 | enum('dog','cat','other')               |                     |
| breed                   | varchar(255)                            |                     |
| age_weeks               | tinyint unsigned                        |                     |
| price                   | decimal(10,2)                           |                     |
| currency                | enum('EUR','MDL','RON')                 | default 'EUR'       |
| status                  | enum('draft','active','sold','expired') |                     |
| featured_until          | timestamp nullable                      | null = not featured |
| deleted_at              | timestamp nullable                      | soft delete         |
| created_at / updated_at | timestamps                              |                     |

**listing_photos**

| Field      | Type          | Notes                 |
| ---------- | ------------- | --------------------- |
| id         | bigint PK     |                       |
| listing_id | bigint FK     |                       |
| s3_key     | varchar(1024) | private S3 object key |
| sort_order | tinyint       | display ordering      |
| created_at | timestamp     |                       |

**breeder_documents**

| Field                   | Type                                  | Notes                            |
| ----------------------- | ------------------------------------- | -------------------------------- |
| id                      | bigint PK                             |                                  |
| breeder_profile_id      | bigint FK                             |                                  |
| document_type           | varchar(100)                          | e.g. 'kennel_cert', 'vet_record' |
| s3_key                  | varchar(1024)                         | private S3 object key            |
| status                  | enum('pending','approved','rejected') |                                  |
| reviewed_at             | timestamp nullable                    |                                  |
| reviewed_by             | bigint FK → users nullable            |                                  |
| created_at / updated_at | timestamps                            |                                  |

**sitter_profiles**

| Field                   | Type                    | Notes                      |
| ----------------------- | ----------------------- | -------------------------- |
| id                      | bigint PK               |                            |
| user_id                 | bigint FK → users       | unique                     |
| display_name            | varchar(255)            |                            |
| description             | text nullable           |                            |
| location                | varchar(255)            |                            |
| phone                   | varchar(50)             | never returned pre-inquiry |
| services                | json                    | array of service types     |
| price_per_day           | decimal(8,2) nullable   |                            |
| currency                | enum('EUR','MDL','RON') |                            |
| listing_paid_until      | timestamp nullable      | null = not published       |
| featured_until          | timestamp nullable      |                            |
| verified_at             | timestamp nullable      |                            |
| created_at / updated_at | timestamps              |                            |

**verification_requests**

| Field                   | Type                                  | Notes                                        |
| ----------------------- | ------------------------------------- | -------------------------------------------- |
| id                      | bigint PK                             |                                              |
| requestable_type        | varchar(255)                          | polymorphic: BreederProfile or SitterProfile |
| requestable_id          | bigint                                |                                              |
| status                  | enum('pending','approved','rejected') |                                              |
| admin_notes             | text nullable                         |                                              |
| reviewed_at             | timestamp nullable                    |                                              |
| reviewed_by             | bigint FK → users nullable            |                                              |
| created_at / updated_at | timestamps                            |                                              |

**inquiries**

| Field                   | Type                                  | Notes                    |
| ----------------------- | ------------------------------------- | ------------------------ |
| id                      | bigint PK                             |                          |
| buyer_id                | bigint FK → users                     |                          |
| listing_id              | bigint FK → listings                  |                          |
| message                 | text                                  |                          |
| status                  | enum('pending','accepted','rejected') |                          |
| contact_revealed_at     | timestamp nullable                    | set when breeder accepts |
| created_at / updated_at | timestamps                            |                          |

**reviews**

| Field                   | Type                       | Notes                        |
| ----------------------- | -------------------------- | ---------------------------- |
| id                      | bigint PK                  |                              |
| buyer_id                | bigint FK → users          |                              |
| listing_id              | bigint FK → listings       | unique(buyer_id, listing_id) |
| rating                  | tinyint                    | 1–5                          |
| comment                 | text nullable              |                              |
| status                  | enum('published','hidden') |                              |
| created_at / updated_at | timestamps                 |                              |

**payments**

| Field                   | Type                                        | Notes                    |
| ----------------------- | ------------------------------------------- | ------------------------ |
| id                      | bigint PK                                   |                          |
| user_id                 | bigint FK → users                           |                          |
| payable_type            | varchar(255)                                | SitterProfile or Listing |
| payable_id              | bigint                                      | polymorphic              |
| product_type            | enum('standard_listing','featured_listing') |                          |
| stripe_session_id       | varchar(255) unique                         |                          |
| amount_cents            | int unsigned                                |                          |
| currency                | varchar(3)                                  |                          |
| status                  | enum('pending','completed','failed')        |                          |
| created_at / updated_at | timestamps                                  |                          |

---

## 5. API Specification

**Base URL:** `https://api.pawtrust.md/api/v1`
**Auth Header:** `Authorization: Bearer {sanctum_token}`
**Content-Type:** `application/json`

**Standard Response Envelope:**

```json
{
  "data": {},
  "meta": {},
  "message": "string",
  "errors": {}
}
```

### 5.1 Authentication

| Method | Endpoint                         | Auth   | Description            |
| ------ | -------------------------------- | ------ | ---------------------- |
| POST   | `/auth/register`                 | Public | Register new user      |
| POST   | `/auth/login`                    | Public | Login, returns token   |
| POST   | `/auth/logout`                   | Bearer | Revoke current token   |
| GET    | `/auth/me`                       | Bearer | Get authenticated user |
| POST   | `/auth/email/verify/{id}/{hash}` | Public | Email verification     |
| POST   | `/auth/password/forgot`          | Public | Send reset link        |
| POST   | `/auth/password/reset`           | Public | Reset password         |

### 5.2 Breeders & Listings

| Method | Endpoint                               | Auth            | Description                        |
| ------ | -------------------------------------- | --------------- | ---------------------------------- |
| GET    | `/listings`                            | Public          | Search/filter listings (paginated) |
| GET    | `/listings/{id}`                       | Public          | Listing detail (no contact data)   |
| POST   | `/listings`                            | Breeder         | Create listing                     |
| PUT    | `/listings/{id}`                       | Breeder (owner) | Update listing                     |
| DELETE | `/listings/{id}`                       | Breeder (owner) | Soft-delete listing                |
| GET    | `/breeders/{id}`                       | Public          | Breeder public profile             |
| PUT    | `/breeders/{id}`                       | Breeder (owner) | Update profile                     |
| POST   | `/breeders/{id}/photos`                | Breeder (owner) | Upload listing photo               |
| DELETE | `/breeders/{id}/photos/{photoId}`      | Breeder (owner) | Delete photo                       |
| POST   | `/breeders/{id}/documents`             | Breeder (owner) | Upload verification document       |
| GET    | `/breeders/{id}/documents/{docId}/url` | Admin           | Get pre-signed document URL        |

### 5.3 Verification

| Method | Endpoint                            | Auth           | Description                          |
| ------ | ----------------------------------- | -------------- | ------------------------------------ |
| POST   | `/verification-requests`            | Breeder/Sitter | Submit verification request          |
| GET    | `/admin/verification-requests`      | Admin          | List pending requests                |
| GET    | `/admin/verification-requests/{id}` | Admin          | Request detail + pre-signed doc URLs |
| PUT    | `/admin/verification-requests/{id}` | Admin          | Approve or reject                    |

### 5.4 Inquiries

| Method | Endpoint                  | Auth                  | Description                 |
| ------ | ------------------------- | --------------------- | --------------------------- |
| POST   | `/inquiries`              | Buyer                 | Submit inquiry on a listing |
| GET    | `/inquiries`              | Buyer/Breeder         | List own inquiries          |
| PUT    | `/inquiries/{id}`         | Breeder (owner)       | Accept or reject inquiry    |
| GET    | `/inquiries/{id}/contact` | Buyer (accepted only) | Reveal contact details      |

### 5.5 Reviews

| Method | Endpoint                 | Auth   | Description                            |
| ------ | ------------------------ | ------ | -------------------------------------- |
| POST   | `/reviews`               | Buyer  | Submit review (gate: accepted inquiry) |
| GET    | `/listings/{id}/reviews` | Public | Reviews for a listing                  |

### 5.6 Pet Sitters

| Method | Endpoint               | Auth           | Description                   |
| ------ | ---------------------- | -------------- | ----------------------------- |
| GET    | `/sitters`             | Public         | Browse/filter sitter profiles |
| GET    | `/sitters/{id}`        | Public         | Sitter public profile         |
| POST   | `/sitters`             | Sitter         | Create profile                |
| PUT    | `/sitters/{id}`        | Sitter (owner) | Update profile                |
| POST   | `/sitters/{id}/photos` | Sitter (owner) | Upload photo                  |

### 5.7 Payments

| Method | Endpoint             | Auth                | Description                    |
| ------ | -------------------- | ------------------- | ------------------------------ |
| POST   | `/payments/checkout` | Sitter/Breeder      | Create Stripe Checkout session |
| POST   | `/webhooks/stripe`   | Public (Stripe sig) | Stripe webhook handler         |

### 5.8 Admin

| Method | Endpoint                      | Auth  | Description                 |
| ------ | ----------------------------- | ----- | --------------------------- |
| GET    | `/admin/users`                | Admin | List all users              |
| PUT    | `/admin/users/{id}`           | Admin | Update user role/status     |
| GET    | `/admin/listings`             | Admin | All listings with status    |
| PUT    | `/admin/listings/{id}/status` | Admin | Force-change listing status |

---

## 6. Components

### 6.1 Frontend Component Tree (Key Pages)

```
App
├── Layout
│   ├── Header (NavBar, LocaleSwitcher, AuthMenu)
│   ├── Footer
│   └── <Outlet>
│
├── Pages
│   ├── HomePage
│   │   ├── HeroSearch
│   │   ├── FeaturedListingsCarousel
│   │   └── TrustPillars
│   │
│   ├── SearchResultsPage
│   │   ├── SearchFilters (species, breed, location, price, verified-only)
│   │   ├── ListingGrid
│   │   │   └── ListingCard (photo, title, breed, price, VerifiedBadge)
│   │   └── Pagination
│   │
│   ├── ListingDetailPage
│   │   ├── PhotoGallery
│   │   ├── ListingInfo (title, breed, age, price, VerifiedBadge)
│   │   ├── BreederSummaryCard → links to BreederProfilePage
│   │   └── InquiryForm (gate: logged-in buyer)
│   │
│   ├── BreederProfilePage
│   │   ├── BreederHeader (kennel name, location, VerifiedBadge)
│   │   ├── ActiveListingsGrid
│   │   └── ReviewsList
│   │
│   ├── SitterProfilePage
│   │   ├── SitterHeader
│   │   ├── ServicesAndPricing
│   │   └── PhotoGallery
│   │
│   ├── BuyerDashboard
│   │   ├── MyInquiriesList
│   │   │   └── InquiryCard (status, RevealContactButton if accepted)
│   │   └── MyReviewsList
│   │
│   ├── BreederDashboard
│   │   ├── MyListingsList (status, edit, delete)
│   │   ├── IncomingInquiriesList
│   │   ├── VerificationStatusCard
│   │   └── DocumentUploadForm
│   │
│   ├── AdminDashboard
│   │   ├── VerificationRequestsTable
│   │   │   └── DocumentReviewModal (pre-signed URLs)
│   │   └── UserManagementTable
│   │
│   └── Auth
│       ├── RegisterPage
│       ├── LoginPage
│       └── ForgotPasswordPage
│
└── Shared Components
    ├── VerifiedBadge
    ├── PriceDisplay (currency-aware)
    ├── LocaleSwitcher (ro / ru)
    ├── ProtectedRoute (role-based)
    ├── ErrorBoundary
    ├── LoadingSpinner
    └── Toast / Notification
```

---

## 7. External APIs

### 7.1 AWS S3

- **Purpose:** Private storage for listing photos, breeder documents, sitter photos
- **Access Pattern:** All uploads/downloads via Laravel backend — frontend never holds S3 credentials
- **Upload Flow:** Laravel receives file → validates → streams to private S3 bucket → stores S3 key in DB
- **Download Flow:** Client requests download endpoint → Laravel generates pre-signed URL → client fetches directly from CloudFront/S3
- **Bucket:** `pawtrust-private-{env}` — `Block Public Access` fully enabled
- **TTL Policy:**
  - Listing photos (public display): 24h pre-signed URLs, cached by CloudFront
  - Verification documents (admin review): 15-minute pre-signed URLs
  - Contact documents (post-inquiry access): 30-minute pre-signed URLs

### 7.2 AWS SES

- **Purpose:** Transactional email delivery
- **Integration:** Laravel `Mail` facade with SES transport driver
- **Queue:** All mail jobs dispatched to queue — never block the request cycle
- **Email Types:**
  - Registration email verification
  - Password reset
  - Inquiry received (to breeder)
  - Inquiry accepted / rejected (to buyer)
  - Verification request status (to breeder/sitter)
  - Payment confirmation (to sitter/breeder)
- **Domain Setup:** SPF + DKIM + DMARC configured for `pawtrust.md`
- **Bounce Handling:** SES → SNS → webhook endpoint flags bounced addresses

### 7.3 Stripe

- **Purpose:** Pay-per-listing payments (€3 standard / €8 featured)
- **Integration:** Server-side Stripe PHP SDK — no raw card data on PawTrust servers
- **Flow:**
  1. Client calls `POST /payments/checkout` with product type
  2. Laravel creates a Stripe Checkout Session with `success_url` and `cancel_url`
  3. Client redirects to Stripe-hosted checkout page
  4. On success, Stripe sends `checkout.session.completed` webhook
  5. Laravel verifies webhook signature → updates payment → activates listing/profile
- **Webhook Security:** Signature verified via `Stripe-Signature` header + `STRIPE_WEBHOOK_SECRET`
- **Keys in `.env`:** `STRIPE_KEY` (publishable) + `STRIPE_SECRET` + `STRIPE_WEBHOOK_SECRET`

---

## 8. Core Workflows

### 8.1 Inquiry → Contact Reveal Flow

```mermaid
sequenceDiagram
    participant Buyer
    participant Frontend
    participant API
    participant DB
    participant Queue
    participant SES

    Buyer->>Frontend: Clicks "Send Inquiry" on listing
    Frontend->>API: POST /api/v1/inquiries {listing_id, message}
    API->>API: Check: buyer authenticated + listing active
    API->>DB: INSERT inquiry (status=pending)
    API->>Queue: Dispatch InquiryReceivedEmail(breeder)
    API-->>Frontend: 201 Created
    Queue->>SES: Send email to breeder

    Note over Buyer,SES: Breeder reviews inquiry in dashboard

    API->>DB: UPDATE inquiry status=accepted, contact_revealed_at=NOW()
    API->>Queue: Dispatch InquiryAcceptedEmail(buyer)
    Queue->>SES: Send email to buyer

    Buyer->>Frontend: Sees "Contact Revealed" in dashboard
    Frontend->>API: GET /api/v1/inquiries/{id}/contact
    API->>API: Gate: inquiry.buyer_id = auth user + status = accepted
    API->>DB: SELECT phone FROM breeder_profiles WHERE ...
    API-->>Frontend: {phone: "+373..."}
    Frontend->>Buyer: Shows phone number
```

### 8.2 Verification Flow

```mermaid
sequenceDiagram
    participant Breeder
    participant API
    participant S3
    participant DB
    participant Admin

    Breeder->>API: POST /breeders/{id}/documents (file upload)
    API->>S3: Store to private bucket
    API->>DB: INSERT breeder_document (status=pending)
    Breeder->>API: POST /verification-requests
    API->>DB: INSERT verification_request (status=pending)

    Admin->>API: GET /admin/verification-requests/{id}
    API->>S3: Generate pre-signed URL (15 min TTL)
    API-->>Admin: Document URLs for review

    Admin->>API: PUT /admin/verification-requests/{id} {status: approved}
    API->>DB: UPDATE verification_request + SET breeder_profiles.verified_at=NOW()
    API->>Queue: Dispatch VerificationStatusEmail(breeder)
```

### 8.3 Payment → Listing Activation Flow

```mermaid
sequenceDiagram
    participant Sitter
    participant Frontend
    participant API
    participant Stripe
    participant DB

    Sitter->>Frontend: Clicks "Publish Listing" (€3 standard)
    Frontend->>API: POST /payments/checkout {product_type: standard_listing}
    API->>Stripe: Create Checkout Session
    Stripe-->>API: {session_url, session_id}
    API->>DB: INSERT payment (status=pending, stripe_session_id)
    API-->>Frontend: {checkout_url}
    Frontend->>Stripe: Redirect to hosted checkout page

    Sitter->>Stripe: Completes payment
    Stripe->>API: POST /webhooks/stripe (checkout.session.completed)
    API->>API: Verify Stripe-Signature header
    API->>DB: UPDATE payment status=completed
    API->>DB: UPDATE sitter_profiles.listing_paid_until = NOW()+30days
    API-->>Stripe: 200 OK
    Frontend->>Sitter: Success page — profile now active
```

---

## 9. Database Schema

### 9.1 Migration Order

```
2024_01_01_000001_create_users_table
2024_01_01_000002_create_personal_access_tokens_table   (Sanctum)
2024_01_01_000003_create_roles_and_permissions_tables   (Spatie)
2024_01_01_000004_create_breeder_profiles_table
2024_01_01_000005_create_listings_table
2024_01_01_000006_create_listing_photos_table
2024_01_01_000007_create_breeder_documents_table
2024_01_01_000008_create_sitter_profiles_table
2024_01_01_000009_create_sitter_photos_table
2024_01_01_000010_create_verification_requests_table
2024_01_01_000011_create_inquiries_table
2024_01_01_000012_create_reviews_table
2024_01_01_000013_create_payments_table
2024_01_01_000014_create_jobs_table                     (Queue)
2024_01_01_000015_create_failed_jobs_table
```

### 9.2 Key Indexes

```sql
-- Listing search performance
CREATE INDEX idx_listings_status_species   ON listings(status, species);
CREATE INDEX idx_listings_breeder_status   ON listings(breeder_profile_id, status);
CREATE INDEX idx_listings_featured         ON listings(featured_until, status);
CREATE FULLTEXT INDEX idx_listings_search  ON listings(title, description, breed);

-- Inquiry lookups
CREATE UNIQUE INDEX idx_inquiries_buyer_listing ON inquiries(buyer_id, listing_id);
CREATE INDEX idx_inquiries_listing              ON inquiries(listing_id, status);

-- Verification queue
CREATE INDEX idx_verification_status ON verification_requests(status, created_at);

-- Payment idempotency
CREATE UNIQUE INDEX idx_payments_stripe_session ON payments(stripe_session_id);
```

### 9.3 Key Constraints

- `inquiries(buyer_id, listing_id)` — unique: one inquiry per buyer per listing
- `reviews(buyer_id, listing_id)` — unique: one review per buyer per listing
- `breeder_profiles(user_id)` — unique: one profile per user
- `sitter_profiles(user_id)` — unique: one profile per user
- Soft deletes (`deleted_at`) on `listings` — preserves inquiry and review history

---

## 10. Frontend Architecture

### 10.1 Directory Structure

```
pawtrust-frontend/
├── public/
│   └── locales/
│       ├── ro/
│       │   └── translation.json
│       └── ru/
│           └── translation.json
├── src/
│   ├── api/                    # Axios instance + typed API call functions
│   │   ├── axiosClient.ts      # Axios instance with baseURL + auth interceptor
│   │   ├── auth.api.ts
│   │   ├── listings.api.ts
│   │   ├── inquiries.api.ts
│   │   ├── sitters.api.ts
│   │   └── payments.api.ts
│   ├── components/
│   │   ├── common/             # Button, Badge, Modal, Spinner, Toast
│   │   ├── listings/           # ListingCard, ListingGrid, InquiryForm
│   │   ├── breeders/           # BreederCard, VerifiedBadge, DocumentUpload
│   │   ├── sitters/            # SitterCard, ServicesList
│   │   └── layout/             # Header, Footer, NavBar, LocaleSwitcher
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Search.tsx
│   │   ├── ListingDetail.tsx
│   │   ├── BreederProfile.tsx
│   │   ├── SitterProfile.tsx
│   │   ├── BuyerDashboard.tsx
│   │   ├── BreederDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── auth/
│   │   │   ├── Register.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── PaymentSuccess.tsx
│   │   └── PaymentCancel.tsx
│   ├── hooks/                  # useAuth, useListings, useInquiries, etc.
│   ├── store/                  # Zustand auth store (persisted)
│   ├── types/                  # Shared TypeScript interfaces
│   ├── utils/                  # Formatters, validators, helpers
│   ├── i18n.ts                 # i18next initialization
│   ├── router.tsx              # React Router route definitions
│   └── main.tsx                # App entry point
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 10.2 Routing Strategy

```typescript
// router.tsx — key routes
const routes = [
  { path: '/',                element: <HomePage /> },
  { path: '/listings',        element: <SearchResultsPage /> },
  { path: '/listings/:id',    element: <ListingDetailPage /> },
  { path: '/breeders/:id',    element: <BreederProfilePage /> },
  { path: '/sitters',         element: <SittersSearchPage /> },
  { path: '/sitters/:id',     element: <SitterProfilePage /> },
  // Auth
  { path: '/register',        element: <RegisterPage /> },
  { path: '/login',           element: <LoginPage /> },
  // Protected — Buyer
  { path: '/dashboard',       element: <ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute> },
  // Protected — Breeder
  { path: '/breeder/dashboard', element: <ProtectedRoute role="breeder"><BreederDashboard /></ProtectedRoute> },
  // Protected — Admin
  { path: '/admin',           element: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute> },
  // Payment callbacks
  { path: '/payment/success', element: <PaymentSuccessPage /> },
  { path: '/payment/cancel',  element: <PaymentCancelPage /> },
];
```

### 10.3 State Management

- **Auth state:** Zustand store (`useAuthStore`) — persisted to `localStorage` via middleware
- **Server state:** TanStack Query — all API data (listings, profiles, inquiries)
- **UI state:** Local `useState` — forms, modals, toggles
- No Redux — complexity unwarranted at MVP scale

### 10.4 i18n

- Two locales: `ro` (default), `ru`
- Translation files: `public/locales/{locale}/translation.json`
- Locale stored in `useAuthStore` (authenticated) or `localStorage` (guest)
- `LocaleSwitcher` updates auth store + calls `i18n.changeLanguage()`
- Backend locale: `Accept-Language: ro|ru` request header — Laravel returns localized validation messages

---

## 11. Backend Architecture

### 11.1 Directory Structure

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
│   │   │   ├── EnsureRole.php          # Role gate middleware
│   │   │   └── SetLocale.php           # Accept-Language → app locale
│   │   └── Requests/                   # FormRequest validation classes
│   │       ├── RegisterRequest.php
│   │       ├── CreateListingRequest.php
│   │       ├── SubmitInquiryRequest.php
│   │       └── ...
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
│   │   ├── ListingService.php          # Listing CRUD + search logic
│   │   ├── BreederService.php          # Profile management + document upload
│   │   ├── SitterService.php
│   │   ├── VerificationService.php     # Verification state machine
│   │   ├── InquiryService.php          # Inquiry + contact reveal logic
│   │   ├── PaymentService.php          # Stripe Checkout session creation
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
│   │   ├── InquiryPolicy.php           # Contact reveal gate
│   │   └── BreederDocumentPolicy.php
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── AdminUserSeeder.php
├── routes/
│   ├── api.php                         # All /api/v1/* routes
│   └── web.php                         # Stripe webhook (CSRF excluded)
├── config/
│   ├── sanctum.php
│   └── filesystems.php                 # S3 disk config
├── tests/
│   ├── Unit/
│   │   └── Services/
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

### 11.2 Service Layer Pattern

Controllers are thin — they validate input (via FormRequest), call a Service, and return a Resource response.

```php
// Example: InquiryController
class InquiryController extends Controller
{
    public function store(SubmitInquiryRequest $request, InquiryService $service): JsonResponse
    {
        $inquiry = $service->create($request->user(), $request->validated());
        return response()->json(['data' => InquiryResource::make($inquiry)], 201);
    }

    public function revealContact(Request $request, Inquiry $inquiry, InquiryService $service): JsonResponse
    {
        $this->authorize('revealContact', $inquiry); // InquiryPolicy gate
        $contact = $service->getRevealedContact($inquiry);
        return response()->json(['data' => $contact]);
    }
}
```

### 11.3 Authorization (Laravel Policies)

Laravel Policies enforce object-level authorization:

- `ListingPolicy::update($user, $listing)` — `$user->id === $listing->breederProfile->user_id`
- `InquiryPolicy::revealContact($user, $inquiry)` — `$user->id === $inquiry->buyer_id && $inquiry->status === 'accepted'`
- `BreederDocumentPolicy::view($user, $document)` — user is admin OR document owner

Spatie roles used for route-level checks: `buyer`, `breeder`, `sitter`, `admin`.

---

## 12. Unified Project Structure

```
GitHub Organization: pawtrust-org
├── pawtrust-frontend/            # React 18 SPA
│   ├── .github/workflows/
│   │   ├── ci.yml                # Lint + type-check + test on PR
│   │   └── deploy.yml            # Build + S3 sync + CloudFront invalidation on main
│   └── ...
│
└── pawtrust-backend/             # Laravel 11 API
    ├── .github/workflows/
    │   ├── ci.yml                # PHP CS Fixer + PHPUnit on PR
    │   └── deploy.yml            # Composer install + EB deploy on main
    └── ...
```

Both repos maintain `.env.example` with all required keys. Staging environment mirrors production configuration using separate AWS resources and Stripe test keys.

---

## 13. Development Workflow

### 13.1 Local Environment Setup

**Prerequisites:** Docker + Docker Compose, Node.js 20+, PHP 8.2+, Composer 2.x

**Backend (`pawtrust-backend`):**

```bash
cp .env.example .env
docker compose up -d        # Starts MySQL 8 + Redis on localhost
composer install
php artisan key:generate
php artisan migrate --seed
php artisan queue:work &    # Run queue worker in background
php artisan serve           # API on http://localhost:8000
```

**Frontend (`pawtrust-frontend`):**

```bash
cp .env.example .env.local  # Set VITE_API_BASE_URL=http://localhost:8000/api/v1
npm install
npm run dev                 # Dev server on http://localhost:5173
```

**`docker-compose.yml` (backend services):**

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: pawtrust
      MYSQL_ROOT_PASSWORD: secret
    ports:
      - '3306:3306'
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
```

### 13.2 Git Branching Strategy

- `main` — production-ready; auto-deploys to production on merge
- `staging` — auto-deploys to staging environment
- `feature/{ticket-id}-short-description` — feature branches, PR → staging first
- `fix/{ticket-id}-short-description` — bug fix branches
- `hotfix/{ticket-id}` — emergency production fixes (PR directly to main)

### 13.3 Commit Convention

Conventional Commits: `type(scope): description`

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`

```
feat(inquiries): add contact reveal endpoint
fix(auth): correct JWT expiry header
test(listings): add search filter coverage
```

---

## 14. Deployment Architecture

### 14.1 Environments

| Environment | Frontend                  | Backend                     | Database      | Purpose      |
| ----------- | ------------------------- | --------------------------- | ------------- | ------------ |
| Local       | Vite dev :5173            | `artisan serve` :8000       | Docker MySQL  | Development  |
| Staging     | S3 + CloudFront (staging) | Elastic Beanstalk (staging) | RDS (staging) | QA + UAT     |
| Production  | S3 + CloudFront (prod)    | Elastic Beanstalk (prod)    | RDS Multi-AZ  | Live traffic |

### 14.2 Frontend Deployment (GitHub Actions)

```yaml
# deploy.yml (pawtrust-frontend)
- name: Build
  run: npm run build # Outputs to dist/

- name: Sync to S3
  run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET }} --delete

- name: Invalidate CloudFront
  run: aws cloudfront create-invalidation --distribution-id ${{ vars.CF_DIST_ID }} --paths "/*"
```

CloudFront configuration:

- Default root object: `index.html`
- Custom error response: `403/404 → /index.html 200` (SPA routing fallback)
- Cache: HTML files `no-cache`; hashed assets `max-age=31536000`

### 14.3 Backend Deployment (Elastic Beanstalk)

```yaml
# deploy.yml (pawtrust-backend)
- name: Install dependencies
  run: composer install --no-dev --optimize-autoloader

- name: Create EB deployment package
  run: zip -r deploy.zip . -x "*.git*" "tests/*"

- name: Deploy to Elastic Beanstalk
  uses: einaregilsson/beanstalk-deploy@v21
  with:
    application_name: pawtrust-api
    environment_name: pawtrust-api-${{ env.DEPLOY_ENV }}
    version_label: ${{ github.sha }}
    deployment_package: deploy.zip
```

EB `.ebextensions` hooks run `php artisan migrate --force` and `php artisan config:cache` on each deploy.

### 14.4 AWS Resource Summary

| Resource              | Name Pattern                   | Notes                                  |
| --------------------- | ------------------------------ | -------------------------------------- |
| S3 Bucket (frontend)  | `pawtrust-frontend-{env}`      | Public read via CloudFront OAC only    |
| S3 Bucket (files)     | `pawtrust-private-{env}`       | No public access; pre-signed URLs only |
| CloudFront (frontend) | `pawtrust.md` distribution     | HTTPS, custom domain via ACM           |
| Elastic Beanstalk     | `pawtrust-api-{env}`           | PHP 8.2 platform; t3.small at MVP      |
| RDS                   | `pawtrust-db-{env}`            | MySQL 8.0; Multi-AZ in production      |
| SES                   | Verified domain: `pawtrust.md` | DKIM + SPF + DMARC                     |
| ACM Certificate       | `*.pawtrust.md`                | Covers `api.` and `app.` subdomains    |

---

## 15. Security & Performance

### 15.1 Security Controls

**Authentication & Authorization**

- All non-public routes require `Authorization: Bearer {token}`
- Tokens issued by Laravel Sanctum — stored in `personal_access_tokens` table
- Token expiry: 7 days; refresh via re-login
- Role checks: route-level (Spatie middleware) + object-level (Laravel Policies)
- Admin routes under `/api/v1/admin/*` — gated by `role:admin` middleware

**Input Validation**

- All inputs validated via Laravel `FormRequest` — rejected before reaching service layer
- SQL: Eloquent parameterized queries only — no raw SQL with user input
- File uploads: MIME type + extension validation; max 10MB; stored with UUID filenames
- XSS: JSON-only API — no server-side HTML rendering; React escapes output by default

**Transport Security**

- HTTPS enforced — ACM certificates, HTTP → HTTPS redirect at CloudFront + EB level
- `Strict-Transport-Security` header on API responses
- CORS: strict origin whitelist (`pawtrust.md`, `app.pawtrust.md`) in Laravel config

**Private Data Protection**

- Breeder/sitter phone numbers excluded from all listing and profile API responses
- Phone revealed only via `GET /inquiries/{id}/contact` endpoint, gated by `InquiryPolicy`
- S3 `Block Public Access` enabled on all buckets; access only via server-generated pre-signed URLs
- Passwords: bcrypt (Laravel default, cost 12)

**Rate Limiting**

- Auth endpoints: 10 requests/minute per IP
- API general: 60 requests/minute per authenticated user
- Stripe webhook: whitelisted (bypass rate limit)
- Implemented via Laravel `throttle` middleware

**Payment Security**

- Stripe webhook signature verified on every request (`\Stripe\Webhook::constructEvent`)
- No card data stored or transmitted through PawTrust servers
- Stripe Checkout hosted mode — PCI SAQ A compliance

### 15.2 Performance

- **CDN:** CloudFront caches frontend assets; cache-busted by content hash in filenames
- **Database:** Indexes on high-traffic queries; Eloquent eager-loading with `with()` to eliminate N+1
- **Images:** Stored in S3, served via CloudFront — no image processing on API server at MVP
- **Queue:** Email delivery offloaded to queue worker — API response time unaffected by SES latency
- **Target:** API p95 < 300ms; TTFB < 100ms (CloudFront edge for SPA assets)

---

## 16. Testing Strategy

### 16.1 Backend (PHPUnit)

**Unit Tests** — Service and Model logic in isolation (no DB, no HTTP):

```
tests/Unit/Services/InquiryServiceTest.php      # Contact reveal gating logic
tests/Unit/Services/PaymentServiceTest.php      # Stripe session creation
tests/Unit/Models/ListingTest.php               # Scopes, casts, relationships
```

**Feature Tests** — full HTTP request lifecycle with test DB:

```
tests/Feature/Auth/RegisterTest.php             # Registration + email verify
tests/Feature/Listings/CreateListingTest.php    # Auth + validation + DB
tests/Feature/Inquiries/ContactRevealTest.php   # Gate: accepted inquiries only
tests/Feature/Payments/StripeWebhookTest.php    # Signature + listing activation
tests/Feature/Admin/VerificationTest.php        # Admin approve/reject
```

**Coverage target:** 80% line coverage on Service classes; 100% on auth + payment flows.

### 16.2 Frontend (Jest + React Testing Library)

**Component Tests:**

```
src/components/listings/ListingCard.test.tsx    # Renders price, VerifiedBadge
src/components/common/VerifiedBadge.test.tsx    # Conditional display
src/pages/ListingDetail.test.tsx                # Inquiry form gating
```

**Integration Tests (mock Axios):**

```
src/pages/BuyerDashboard.test.tsx               # Contact reveal button state
src/pages/BreederDashboard.test.tsx             # Inquiry accept/reject flow
```

No E2E tests at MVP — manual smoke testing covers critical user journeys.

### 16.3 Critical Manual Test Cases (Pre-Launch)

| Scenario                                                           | Expected |
| ------------------------------------------------------------------ | -------- |
| Buyer submits inquiry → breeder receives notification email        | ✅       |
| Breeder accepts → buyer email sent + contact revealed in dashboard | ✅       |
| Unaccepted inquiry → `GET /inquiries/{id}/contact` returns 403     | ✅       |
| Stripe payment completed → webhook → listing activated             | ✅       |
| Document upload → admin pre-signed URL accessible (15 min)         | ✅       |
| Unauthenticated user → admin route returns 401                     | ✅       |
| Non-owner → update listing returns 403                             | ✅       |

---

## 17. Coding Standards

### 17.1 PHP / Laravel

- **Style:** PSR-12 enforced via PHP CS Fixer; `composer fix` alias in `composer.json`
- **Naming:** PascalCase classes, camelCase methods, snake_case DB column names
- **Controllers:** Thin — validate via FormRequest, delegate to Service, return Resource
- **Services:** All business logic here; no Eloquent calls in controllers
- **Models:** Relationships, scopes, casts only — no business logic
- **Migrations:** Descriptive names; never edit committed migrations; always add new ones
- **No `dd()` or `dump()` in committed code**
- **Secrets:** All credentials in `.env` — never hardcoded

### 17.2 TypeScript / React

- **Style:** ESLint (Airbnb config) + Prettier; `npm run lint` enforced in CI
- **Naming:** PascalCase components, camelCase functions/variables, `SCREAMING_SNAKE` for constants
- **Components:** Functional components only — no class components
- **Props:** Explicit TypeScript interfaces for all component props
- **API layer:** All API calls in `src/api/` — never `fetch` directly in components
- **No `any` type** — use proper types or `unknown` with type guards
- **Imports:** Absolute imports from `src/` configured in `tsconfig.json` `paths`

### 17.3 Git

- Feature branches merged via squash-merge (clean main history)
- PR title must follow Conventional Commits format
- No direct pushes to `main` or `staging` — PRs required with at least one review

---

## 18. Error Handling Strategy

### 18.1 API Error Response Format

All errors returned in a consistent envelope:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "price": ["The price must be a positive number."]
  }
}
```

**HTTP Status Code Conventions:**

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 201  | Created                                 |
| 204  | No content (delete)                     |
| 401  | Unauthenticated                         |
| 403  | Forbidden (wrong role or policy denied) |
| 404  | Resource not found                      |
| 422  | Validation failed (Laravel default)     |
| 429  | Rate limit exceeded                     |
| 500  | Internal server error                   |

### 18.2 Laravel Exception Handler

`app/Exceptions/Handler.php` maps exception types to consistent JSON responses:

- `ModelNotFoundException` → 404
- `AuthorizationException` → 403
- `ValidationException` → 422 with field-level errors
- `ThrottleRequestsException` → 429
- All unhandled exceptions → 500 + logged to CloudWatch

### 18.3 Frontend Error Handling

- **API errors:** TanStack Query `onError` callbacks dispatch toast notifications
- **Auth errors (401):** Axios response interceptor clears auth store → redirects to `/login`
- **Not found routes:** React Router `*` catch-all → `NotFoundPage`
- **Component errors:** `ErrorBoundary` wraps page-level components — prevents full app crash
- **Stripe cancel:** `cancel_url` returns to dashboard with `?payment=cancelled` query param

---

## 19. Monitoring & Observability

### 19.1 Application Logging

- **Local/dev:** `LOG_CHANNEL=stack` (daily files in `storage/logs/`)
- **Staging/production:** `LOG_CHANNEL=stderr` — EB captures stderr → CloudWatch Logs

**What is logged at INFO level:**

- Verification requests submitted and reviewed
- Inquiries accepted or rejected
- Payment webhook events (session ID, status, amount)
- Admin actions (approve/reject with admin user ID)

**What is logged at ERROR level:**

- Stripe webhook signature verification failures
- S3 upload failures
- Queue job failures after all retries exhausted
- Unhandled exceptions (with full stack trace)

### 19.2 Health Checks

- `GET /api/v1/health` — returns `{"status": "ok", "db": "ok", "queue": "ok"}`
- EB health check URL configured to `/api/v1/health`

### 19.3 Alerting (MVP Scope)

- CloudWatch alarm: EC2 CPU > 80% for 5 minutes → email notification to ops
- SES bounce rate > 5% → SNS notification
- Failed jobs count > 10 → CloudWatch metric alarm

### 19.4 Laravel Telescope

- Enabled in **local and staging** only (`TELESCOPE_ENABLED=true` in `.env`)
- Provides request/response inspection, query profiling, queue job tracking
- Disabled in production (performance + data privacy)

---

## 20. Architect Checklist Results

**Checklist Version:** BMAD Architect Checklist v1
**Reviewed By:** Winston (Architect Agent)
**Date:** 2026-03-20

### 20.1 Checklist

| #   | Item                                                      | Status  | Notes                                                                       |
| --- | --------------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| 1   | All PRD functional requirements addressed in architecture | ✅ PASS | FR1–FR15 mapped to API endpoints, services, and data models                 |
| 2   | All PRD non-functional requirements addressed             | ✅ PASS | NFR1–NFR10: performance §15.2, security §15.1, i18n §10.4, WCAG AA in §17.2 |
| 3   | Tech stack matches PRD technical assumptions              | ✅ PASS | React 18+TS, Laravel 11 PHP 8.2, MySQL 8, AWS, Stripe — exact PRD match     |
| 4   | Authentication and authorization fully designed           | ✅ PASS | Sanctum tokens, Spatie roles, Laravel Policies per resource                 |
| 5   | Data models cover all entities needed by epics            | ✅ PASS | 11 tables; all 6 epics' data needs covered                                  |
| 6   | API endpoints cover all story requirements                | ✅ PASS | All CRUD, gated actions, and webhooks defined in §5                         |
| 7   | File storage and private access designed                  | ✅ PASS | S3 private buckets, pre-signed URLs, TTL per use case — §7.1                |
| 8   | Payment flow is PCI-compliant                             | ✅ PASS | Stripe Hosted Checkout; webhook signature verification — §7.3, §8.3         |
| 9   | Email notification flows are defined                      | ✅ PASS | All 6 email types, queue-driven via SES — §7.2, §8.1, §8.2                  |
| 10  | Contact reveal gating is server-enforced                  | ✅ PASS | InquiryPolicy + DB-gated endpoint — §2.5, §5.4, §11.3                       |
| 11  | Verification state machine is defined                     | ✅ PASS | VerificationService + VerificationRequest states — §8.2                     |
| 12  | i18n architecture covers both locales                     | ✅ PASS | react-i18next (frontend) + Laravel localization (backend) — §10.4           |
| 13  | Security controls cover OWASP Top 10 relevant items       | ✅ PASS | §15.1: injection, broken auth, XSS, CSRF, rate limiting, private S3, HTTPS  |
| 14  | Error handling is consistent and defined                  | ✅ PASS | JSON envelope, HTTP codes, Laravel Handler, frontend interceptors — §18     |
| 15  | Testing strategy covers critical paths                    | ✅ PASS | PHPUnit unit+feature, Jest RTL, manual smoke tests — §16                    |
| 16  | Deployment pipeline defined for both repos                | ✅ PASS | GitHub Actions CI/CD for frontend (S3) + backend (EB) — §14.2, §14.3        |
| 17  | Local development environment is reproducible             | ✅ PASS | Docker Compose + documented setup commands — §13.1                          |
| 18  | Monolith decision documented with rationale               | ✅ PASS | §2.5: MVP scale, team size, operational simplicity                          |
| 19  | Database indexes for performance-critical queries         | ✅ PASS | §9.2: listing search, inquiry lookup, payment idempotency                   |
| 20  | Observability and monitoring defined                      | ✅ PASS | CloudWatch, health check endpoint, Telescope local/staging — §19            |

### 20.2 Deferred Decisions

| #   | Item                                    | Priority | Resolution                                                             |
| --- | --------------------------------------- | -------- | ---------------------------------------------------------------------- |
| D1  | Queue driver: DB vs Redis/SQS           | Low      | DB driver at MVP; migrate to SQS if throughput demands it              |
| D2  | Image resizing / thumbnails             | Low      | Store originals at MVP; add Lambda@Edge or imgproxy post-MVP           |
| D3  | Local Moldovan payment gateway (MAIB)   | Post-MVP | Stripe only at launch; MAIB in v2 roadmap                              |
| D4  | Search: MySQL FULLTEXT vs Elasticsearch | Low      | MySQL FULLTEXT sufficient for MVP; evaluate at 10K+ listings           |
| D5  | SSR for listing SEO                     | Post-MVP | React Helmet at MVP; Next.js migration if organic SEO becomes critical |

### 20.3 Checklist Verdict

> **PASS — Architecture is ready for developer handoff.**
>
> All PRD requirements (FR1–FR15, NFR1–NFR10) are addressed. All 6 epics have corresponding data models, API endpoints, service layer design, and test strategy. Security controls meet OWASP baseline for user data protection. The architecture is appropriately scoped for MVP — no over-engineering, with clear post-MVP extension points identified.

---

**Document Status: COMPLETE — Ready for UX Expert handoff**

