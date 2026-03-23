# PawTrust Frontend

React + TypeScript frontend for the PawTrust platform.

## Prerequisites

- Node.js 20+
- npm 10+

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start dev server on port 5173
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable                      | Description                                               |
| ----------------------------- | --------------------------------------------------------- |
| `VITE_API_BASE_URL`           | Backend API URL (default: `http://localhost:8000/api/v1`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (test or live)                     |
| `VITE_APP_ENV`                | `development` or `production`                             |

## Running Tests

```bash
npm run test
```

## Linting & Type Check

```bash
# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# TypeScript type check
npm run type-check
```

## Production Build

```bash
npm run build
# Output in dist/
```
