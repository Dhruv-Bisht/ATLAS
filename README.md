# ATLAS — Automated Talent Locator & Application System

A Vercel-ready global opportunity intelligence dashboard. The globe is the primary UI: internships are red, jobs yellow, scholarships blue. Selecting a marker automatically flies the globe to the opportunity's geographic coordinates and opens its card.

## Included in this starter
- Dark, intelligence-style 3D Earth UI inspired by the supplied reference.
- Red/yellow/blue opportunity markers.
- Automatic globe fly-to on marker selection.
- English-only data model (`language = en`).
- Deadline filtering and automatic expiry in API/database queries.
- Search, type, country, field, work mode, experience and deadline filters.
- Official/company/application URL on every published record.
- Prisma/PostgreSQL schema.
- Seed data for local development.
- Adzuna adapter for jobs when API credentials are supplied.
- Conservative Cheerio scraper utility for pages with an explicit deadline and apply link.
- Vercel cron every 6 hours for ingestion/expiry.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

If `DATABASE_URL` is not available, the UI falls back to the bundled demo dataset so the frontend still runs.

## Deploy on Vercel
1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add a hosted PostgreSQL database and set `DATABASE_URL`.
4. Add `CRON_SECRET` and source credentials if used.
5. Deploy.

Vercel cron calls `/api/ingest`. The route refreshes configured sources and removes expired records. For a production-scale crawler, move heavy scraping to a dedicated worker/queue rather than making a Vercel function crawl the open web.

## Important production notes
- Do not scrape a website unless its terms/robots policy and applicable law allow it. Prefer official APIs, feeds and public career pages.
- Add source-specific adapters rather than one universal scraper.
- Geocode city/country locations during ingestion and store coordinates in PostgreSQL; do not geocode on every map render.
- Add deduplication fingerprints before publishing large volumes of records.
- Keep the application URL and source URL separate so students can always reach the official application page.
