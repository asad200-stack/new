# Multi-Tenant SaaS Store Platform (Next.js + Prisma + PostgreSQL)

Deployable directly to **GitHub + Railway**, with:
- **Multi-tenant stores** (data isolation by `storeId`)
- **Dashboard (English-only)**: stores, products (discounts), media upload, messages, activity log, settings, users/roles
- **Public store**: `/store/<store-slug>` + product page + share buttons + search + EN/AR (RTL when Arabic is enabled)
- **Security**: JWT sessions, RBAC, CSRF protection, password hashing

## URLs

- **Dashboard**: `/dashboard`
- **Public store**: `/store/<STORE-SLUG>`

Demo (after seeding):
- Store slug: `demo-store`
- Owner login: `owner@demo.com` / `Demo12345!`

## Environment variables

Copy `.env.example` → `.env` and fill values:
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: min 32 chars
- **APP_URL**: optional (used for some redirects/links)
- **STORAGE_PATH**: where uploaded media is stored (recommend a persistent volume in production)
- **AUTO_SEED**: optional (`"1"` to seed demo data on first boot if DB is empty)

## Local development

1) Install:

```bash
npm install
```

2) Configure `.env` with a PostgreSQL `DATABASE_URL`.

3) Apply migrations + seed:

```bash
npm run prisma:migrate:dev
npm run seed
```

4) Run:

```bash
npm run dev
```

## Deploy to Railway (GitHub → Railway)

1) Push this repo to GitHub.
2) Create a Railway project → **Deploy from GitHub repo**.
3) Add **PostgreSQL** plugin (Railway will provide `DATABASE_URL`).
4) Set variables:
   - `JWT_SECRET` (random, 32+ chars)
   - `APP_URL` (your Railway public URL)
   - `STORAGE_PATH` (recommended: mount a Railway Volume and set to `/data`)
   - Optional: `AUTO_SEED=1` for first deploy only
5) Deploy.

### Migrations

On each start, the app runs `prisma migrate deploy` (see `scripts/start.mjs`).

## Create a new store

1) Register at `/register`
2) Go to `/dashboard` → **New store**
3) Your store public link becomes: `/store/<your-slug>`
