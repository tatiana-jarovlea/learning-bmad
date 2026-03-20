# Deployment Architecture — PawTrust

[Source: architecture.md §14]

---

## Environments

| Environment | Frontend                  | Backend                     | Database      | Purpose      |
| ----------- | ------------------------- | --------------------------- | ------------- | ------------ |
| Local       | Vite dev :5173            | `artisan serve` :8000       | Docker MySQL  | Development  |
| Staging     | S3 + CloudFront (staging) | Elastic Beanstalk (staging) | RDS (staging) | QA + UAT     |
| Production  | S3 + CloudFront (prod)    | Elastic Beanstalk (prod)    | RDS Multi-AZ  | Live traffic |

---

## Frontend Deployment (GitHub Actions)

```yaml
# .github/workflows/deploy.yml (pawtrust-frontend)
- name: Build
  run: npm run build # Outputs to dist/

- name: Sync to S3
  run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET }} --delete

- name: Invalidate CloudFront
  run: aws cloudfront create-invalidation --distribution-id ${{ vars.CF_DIST_ID }} --paths "/*"
```

**CloudFront configuration:**

- Default root object: `index.html`
- Custom error response: `403/404 → /index.html 200` (SPA routing fallback)
- Cache: HTML files `no-cache`; hashed assets `max-age=31536000`
- Origin Access Control (OAC) — S3 bucket not publicly accessible

---

## Backend Deployment (Elastic Beanstalk)

```yaml
# .github/workflows/deploy.yml (pawtrust-backend)
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

**EB `.ebextensions` hooks** (run on every deploy):

```
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## AWS Resource Summary

| Resource          | Name Pattern               | Notes                                             |
| ----------------- | -------------------------- | ------------------------------------------------- |
| S3 (frontend)     | `pawtrust-frontend-{env}`  | Public read via CloudFront OAC only               |
| S3 (files)        | `pawtrust-private-{env}`   | Block Public Access enabled; pre-signed URLs only |
| CloudFront        | `pawtrust.md` distribution | HTTPS, custom domain via ACM                      |
| Elastic Beanstalk | `pawtrust-api-{env}`       | PHP 8.2 platform; t3.small at MVP                 |
| RDS               | `pawtrust-db-{env}`        | MySQL 8.0; Multi-AZ in production only            |
| SES               | Verified: `pawtrust.md`    | DKIM + SPF + DMARC configured                     |
| ACM Certificate   | `*.pawtrust.md`            | Covers `api.pawtrust.md` + `app.pawtrust.md`      |

**Region:** `eu-central-1` (Frankfurt)

---

## Local Development Setup

### Prerequisites

- Docker + Docker Compose
- Node.js 20+
- PHP 8.2+
- Composer 2.x

### Backend

```bash
cd pawtrust-backend
cp .env.example .env
docker compose up -d          # MySQL 8 on localhost:3306
composer install
php artisan key:generate
php artisan migrate --seed
php artisan queue:work &      # Background queue worker
php artisan serve             # API on http://localhost:8000
```

### Frontend

```bash
cd pawtrust-frontend
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:8000/api/v1
npm install
npm run dev                   # Dev server on http://localhost:5173
```

### docker-compose.yml (backend services)

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: pawtrust
      MYSQL_ROOT_PASSWORD: secret
    ports:
      - '3306:3306'
    volumes:
      - db_data:/var/lib/mysql
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
volumes:
  db_data:
```

---

## Git Branching Strategy

- `main` — production-ready; auto-deploys to production on merge
- `staging` — auto-deploys to staging environment
- `feature/{ticket-id}-short-description` — PR → `staging` first
- `fix/{ticket-id}-short-description` — bug fixes
- `hotfix/{ticket-id}` — emergency fixes (PR directly to `main`)

