# Tech Stack — PawTrust

[Source: architecture.md §3]

---

## Frontend

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

## Backend

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

## Database

| Technology | Version | Purpose                     |
| ---------- | ------- | --------------------------- |
| MySQL      | 8.0     | Primary relational database |
| AWS RDS    | —       | Managed MySQL hosting       |

## Infrastructure & DevOps

| Service                     | Purpose                                     |
| --------------------------- | ------------------------------------------- |
| AWS EC2 / Elastic Beanstalk | Laravel API hosting                         |
| AWS RDS (MySQL 8)           | Managed database                            |
| AWS S3                      | Private document + photo storage            |
| AWS CloudFront              | CDN — frontend SPA + private asset delivery |
| AWS SES                     | Transactional email delivery                |
| AWS ACM                     | SSL/TLS certificates                        |
| Docker Compose              | Local development environment               |
| GitHub Actions              | CI/CD pipeline                              |

**Deployment Region:** `eu-central-1` (Frankfurt) — lowest latency to Moldova + Romania

