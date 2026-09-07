# ATLAS — Automated Talent Locator & Application System

ATLAS is a global opportunity map for jobs, internships and scholarships. The globe is the primary discovery interface; opportunities are normalized, located, deduplicated by source identity, and automatically removed when their explicit deadline passes or when a source listing has gone stale.

## Data sources

The default ingestion pipeline uses **no paid API keys**:

- **Himalayas Remote Jobs API** — public JSON API, no authentication required. ATLAS uses it server-side and displays source attribution.
- **Arbeitnow Job Board API** — public job feed. ATLAS uses it as a no-key discovery source.
- **Scholarship program catalog** — optional free tier for scholarship data. It currently provides 100 requests/day and requires a free API key. The current free dataset covers Australia and New Zealand.
- **Adzuna** — optional. If you add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`, ATLAS also ingests Adzuna listings. The developer portal requires registration for these credentials. ATLAS still works when both variables are empty.

JobSpy, Firecrawl, SerpApi and Apify are intentionally **not required for the Vercel deployment**. JobSpy is a Python scraper and is better run as a separate worker rather than inside a Next.js/Vercel request. Firecrawl/SerpApi/Apify can be added later as optional adapters without making the core platform dependent on paid services.

## Important deadline rule

ATLAS never invents a deadline when a source does not publish one. For example, some job feeds expose an expiry date while others do not. If an explicit deadline exists, ATLAS stores it and removes the listing after it passes. If a source does not provide a deadline, ATLAS keeps the listing only while it continues to appear in the source; the ingestion job removes such listings after seven days without seeing them.

## Local setup

1. Copy `.env.example` to `.env`.
2. Add a PostgreSQL `DATABASE_URL` for persistent data.
3. Optionally add free Adzuna developer credentials.
4. Run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

The frontend can still display seed data when the database is unavailable.

## Vercel

Set `DATABASE_URL` and `CRON_SECRET` in Vercel project environment variables. The cron endpoint is `/api/ingest`.

The ingestion endpoint is protected by `CRON_SECRET` when it is configured.
