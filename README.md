# TrueCost — Accra Rent Benchmarks

> "We show Accra renters the true cost of every neighbourhood — real prices, real living conditions — before agents or landlords can mislead them."

**What this site is:** a rental-intelligence website for Accra, Ghana. It contains 10 date-stamped area guides, 4 property-type guides, a move-in planning calculator, tenant-information articles, rent notes, lead + contact + newsletter capture, and WhatsApp integration. Benchmark provenance is shown where recorded; missing source/sample details are flagged for owner review.

**What's inside:** Next.js App Router pages · reusable components · 4 serverless API routes · Supabase Postgres integration · sitemap/robots/OG/FAQ schema · Decap CMS editing UI at `/admin` · partner submission/listing tools (`/list-property`, `/listings`, featured-agent slots, private `/track` dashboard, printable agent pitch in `pitch/`).

---

## Run it locally (5 minutes)

Requirements: Node.js 20+ and npm.

```bash
git clone <your-repo-url> truecost
cd truecost
npm install
cp .env.example .env.local   # works without keys (dev fallback stores forms in data/*.jsonl)
npm run dev
```

Open **http://localhost:3000**. That's the whole site.

## Connect the database + email (10 minutes, still free)

1. Create a project at **supabase.com** → open SQL Editor, open `supabase/schema.sql` locally, and paste the file contents into the editor (do not type the filename as SQL).
2. Copy the Project URL + a server-only Supabase service-role key into `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Never expose that key to browser code.
3. (Optional) Add a **Resend** key for owner emails + **Cloudflare Turnstile** keys for spam shield.
4. Restart `npm run dev` — forms now store in Postgres and notify you by email.

## Deploy to Netlify (free, auto-deploys on every push)

```bash
git add -A && git commit -m "launch" && git push origin main
```

Then: **Netlify → Add new project → Import from Git** → select this repository → add the environment variables in **Project configuration → Environment variables** → Deploy. Set `TRACKER_ACCESS_SECRET` to a private value in Netlify; never commit its real value. Every future `git push` redeploys automatically.

## Edit content (no code — for the buyer)

- **Content:** the repository includes a Decap CMS UI at `/admin`; its Git Gateway/authentication setup still needs owner configuration and was not live-verified in this audit.
- **Guides/prices:** edit the Markdown files in `content/` and push. Keep source, check-date, sample-size, price-basis, limitations, and review fields honest; do not fill missing provenance with guesses.
- **WhatsApp number:** one line in `src/lib/site.ts` (`SITE.whatsapp`).

## Canonical host and custom domains

The repository currently uses `https://trucost.netlify.app/` as its canonical public host. Keep the Netlify site URL, metadata, sitemap, robots, and structured data aligned. If the owner later adopts a custom domain, change `CANONICAL_SITE_URL` in `src/lib/site.ts` and verify every canonical before publishing; do not change only an environment variable.

## Project map

| Path | Purpose |
|---|---|
| `src/app/` | All 18 pages + 4 API routes + sitemap/robots |
| `src/components/` | 17 reusable blocks (header, forms, calculator, search…) |
| `pitch/` | Printable agent pitch (HTML+PDF) + WhatsApp recruiting scripts |
| `src/lib/` | Content engine, validation, database, email helpers |
| `content/` | Area guides, guides, news, rights, legal (Markdown) |
| `public/images/` | Logo pack + OG image |
| `supabase/schema.sql` | One-click database setup |

Built solo-dev friendly: commented code, no paid dependency, no server to babysit.
