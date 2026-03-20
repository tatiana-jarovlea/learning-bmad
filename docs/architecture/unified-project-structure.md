# Unified Project Structure — PawTrust

[Source: architecture.md §12]

---

## Repository Overview

```
GitHub Organization: pawtrust-org
├── pawtrust-frontend/    → React 18 + TypeScript SPA
└── pawtrust-backend/     → PHP 8.2 + Laravel 11 REST API
```

- **Structure:** Polyrepo — two independent Git repositories
- **Monorepo Tool:** N/A — separate repos, separate build pipelines
- **Interface boundary:** Versioned REST JSON API (`/api/v1/`)
- No shared TypeScript/PHP code between repos at MVP

---

## Frontend CI/CD

```yaml
# .github/workflows/ci.yml — runs on every PR
steps:
  - npm install
  - npm run lint # ESLint + Prettier check
  - npm run type-check # tsc --noEmit
  - npm run test:ci # Jest (no watch)
```

```yaml
# .github/workflows/deploy.yml — runs on push to main
steps:
  - npm run build # Vite → dist/
  - aws s3 sync dist/ s3://${S3_BUCKET} --delete
  - aws cloudfront create-invalidation ...
```

---

## Backend CI/CD

```yaml
# .github/workflows/ci.yml — runs on every PR
steps:
  - composer install
  - ./vendor/bin/php-cs-fixer fix --dry-run # Style check
  - php artisan test # PHPUnit
```

```yaml
# .github/workflows/deploy.yml — runs on push to main
steps:
  - composer install --no-dev --optimize-autoloader
  - zip -r deploy.zip . -x "*.git*" "tests/*"
  - einaregilsson/beanstalk-deploy@v21
```

---

## Environment Variables

Both repos commit `.env.example` with all required keys and no values. Never commit `.env`.

### pawtrust-backend `.env.example` (key variables)

```dotenv
APP_NAME=PawTrust
APP_ENV=local
APP_KEY=
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pawtrust
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database

MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@pawtrust.md

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=eu-central-1
AWS_BUCKET=pawtrust-private-local
AWS_CLOUDFRONT_URL=

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NOTIFICATION_EMAIL=

SKIP_LISTING_PAYMENT=true
TELESCOPE_ENABLED=true
```

### pawtrust-frontend `.env.example` (key variables)

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_APP_ENV=development
```

