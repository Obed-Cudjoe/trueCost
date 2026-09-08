# TrueCost — Accra Rent Benchmarks

> "We show Accra renters the true cost of every neighbourhood — real prices, real living conditions — before agents or landlords can mislead them."

**What this site is:** a finished, SEO-ready rental-intelligence website for Accra, Ghana. 10 verified area guides, 4 property-type guides, a move-in cost calculator, tenant-rights library, rent news, lead + contact + newsletter capture, and WhatsApp integration. Running cost: **$0/month** on free tiers.

**What's inside:** 15 page templates · 14 reusable components · 3 serverless API routes · Supabase Postgres · sitemap/robots/OG/FAQ schema · Decap CMS editing UI at `/admin`.

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

1. Create a free project at **supabase.com** → run `supabase/schema.sql` in SQL Editor.
2. Copy Project URL + `service_role` key into `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. (Optional) Add a **Resend** key for owner emails + **Cloudflare Turnstile** keys for spam shield.
4. Restart `npm run dev` — forms now store in Postgres and notify you by email.

## Deploy to Vercel (free, auto-deploys on every push)

```bash
git add -A && git commit -m "launch" && git push origin main
```

Then: **vercel.com → Add New → Project → Import** this repo → add the same env vars → Deploy. Every future `git push` redeploys automatically; every pull request gets a preview URL.

## Edit content (no code — for the buyer)

- **Guides/prices:** open `yoursite.com/admin` (Decap CMS), edit, save — the site rebuilds itself.
- **Or:** edit any file in `content/` and push — same result.
- **WhatsApp number:** one line in `src/lib/site.ts` (`SITE.whatsapp`).

## Attach a custom domain (sale day)

Vercel → Project → Settings → Domains → Add `yourdomain.com`, then at your registrar add an **A record** `@ → 76.76.21.21` and a **CNAME** `www → cname.vercel-dns.com`. HTTPS is automatic. Full steps with Cloudflare alternative: see the Technical Architecture PDF in the project pack.

## Project map

| Path | Purpose |
|---|---|
| `src/app/` | All 15 pages + 3 API routes + sitemap/robots |
| `src/components/` | 14 reusable blocks (header, forms, calculator, search…) |
| `src/lib/` | Content engine, validation, database, email helpers |
| `content/` | Area guides, guides, news, rights, legal (Markdown) |
| `public/images/` | Logo pack + OG image |
| `supabase/schema.sql` | One-click database setup |

Built solo-dev friendly: commented code, no paid dependency, no server to babysit.
