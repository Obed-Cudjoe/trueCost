// P1 — Homepage: image hero + search + stats, source strip, budget browse, trending,
// how-it-works, community voices, news, rights, trust + newsletter.
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import AreaCard from "@/components/AreaCard";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getAreas, getNews, getRights } from "@/lib/content";

const SOURCES = ["Jiji listings", "Meqasa", "TikTok rooms", "Agent quotes", "Tenant reports", "Facebook groups"];
const BUDGETS = [
  { img: "/images/area-compound.jpg", name: "Budget", desc: "Rooms from GH₵500 in Kasoa, Madina & Tema", href: "/areas" },
  { img: "/images/area-estate.jpg", name: "Mid-range", desc: "Estates & apartments, GH₵1,500–6,000", href: "/areas" },
  { img: "/images/area-interior.jpg", name: "Premium", desc: "East Legon, Osu & Cantonments living", href: "/areas" },
];
const VOICES = [
  ["“They showed me one house online, then took me to another after I paid the viewing fee.”", "Renter, Spintex"],
  ["“My landlord demanded a fresh year upfront mid-tenancy. The building is falling apart.”", "Renter, Labadi"],
  ["“Two years' rent for a single room came to GH₵36,000. On a service allowance.”", "Graduate, Accra"],
];

export default function Home() {
  const areas = getAreas();
  const news = getNews().slice(0, 3);
  const rightsCount = getRights().length;
  const priceCount = areas.reduce((n, a) => n + a.prices.length, 0);

  return (
    <>
      {/* HERO */}
      <section className="hero-img relative overflow-hidden rounded-3xl" style={{ backgroundImage: "url(/images/hero-accra.jpg)" }}>
        <div className="hero-overlay px-6 py-16 text-center text-white md:py-24">
          <p className="rise section-eyebrow mb-4 inline-block rounded-full border border-gold/70 px-4 py-1 text-[11px] font-bold uppercase text-gold">
            Ghana's rent-truth finder
          </p>
          <h1 className="rise rise-1 font-display mx-auto max-w-3xl text-4xl leading-tight md:text-6xl">
            Find what it <em className="text-gold">really</em> costs to rent in Accra.
          </h1>
          <p className="rise rise-2 mx-auto mt-4 max-w-2xl text-slate-200">
            One search. Verified benchmarks, water/power realities, and true move-in math — before anyone quotes you a price.
          </p>
          <div className="rise rise-3 mt-7 flex justify-center"><SearchBar large /></div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-slate-300">Popular:</span>
            {["spintex", "kasoa", "madina", "east-legon"].map((s) => (
              <Link key={s} href={`/areas/${s}`} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 capitalize backdrop-blur transition hover:border-gold hover:text-gold">
                {s.replace("-", " ")}
              </Link>
            ))}
            <Link href="/calculator" className="rounded-full bg-gold px-3 py-1 font-bold text-ink transition hover:bg-gold-soft">🧮 Calculator</Link>
          </div>
          {/* Stats band */}
          <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            {[[String(areas.length), "areas covered"], [String(priceCount), "prices checked"], ["Sep 2026", "last verified"]].map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-2xl text-gold md:text-3xl">{n}</dd>
                <dd className="text-xs text-slate-300">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SOURCE STRIP */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-5" aria-label="Verified sources">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">Every benchmark cross-checked across</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-ink">
          {SOURCES.map((s) => <li key={s} className="flex items-center gap-1.5"><span className="text-leaf">✓</span>{s}</li>)}
        </ul>
      </section>

      {/* BROWSE BY BUDGET */}
      <section className="mt-12" aria-label="Browse by budget">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Start with your pocket</p>
        <h2 className="font-display mt-1 text-3xl text-ink">Browse by budget</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {BUDGETS.map((b) => (
            <Link key={b.name} href={b.href} className="card-hover group relative overflow-hidden rounded-2xl">
              <Image src={b.img} alt={b.name} width={600} height={400} className="h-52 w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <span className="absolute bottom-0 p-5">
                <span className="font-display block text-2xl text-white">{b.name}</span>
                <span className="block text-sm text-slate-200">{b.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING AREAS */}
      <section className="mt-12" aria-label="Trending areas">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Most checked this week</p>
            <h2 className="font-display mt-1 text-3xl text-ink">Trending areas</h2>
          </div>
          <Link href="/areas" className="link-arrow shrink-0 text-sm font-semibold text-gold-deep">All areas →</Link>
        </div>
        <div className="swipe-row flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {areas.slice(0, 6).map((a) => (
            <div key={a.slug} className="w-72 shrink-0 md:w-auto"><AreaCard area={a} /></div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="dot-grid mt-12 rounded-3xl bg-ink px-6 py-12 text-white" aria-label="How it works">
        <p className="section-eyebrow text-center text-xs font-bold uppercase text-gold">Three steps to the honest price</p>
        <h2 className="font-display mt-1 text-center text-3xl">How TrueCost works</h2>
        <ol className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-3">
          {[["Search any area", "Spintex to Tema — benchmarks, realities, and FAQs on one page."],
            ["Calculate the true total", "Advance + 10% agent cut + hidden fees. No surprises at signing."],
            ["Get matched free", "Tell us budget + area. A human replies within 24 hours."]].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-ink-line bg-ink-soft p-6">
              <p className="font-display text-4xl text-gold">0{i + 1}</p>
              <h3 className="mt-2 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-slate-300">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center">
          <Link href="/about" className="btn-ghost rounded-lg border border-slate-500 px-5 py-2.5 text-sm font-semibold">Read our method →</Link>
        </p>
      </section>

      {/* COMMUNITY VOICES */}
      <section className="mt-12" aria-label="Community voices">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Why this site exists — in renters' own words</p>
        <h2 className="font-display mt-1 text-3xl text-ink">46 voices. One verdict: show us the truth.</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {VOICES.map(([q, who]) => (
            <figure key={q} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5">
              <blockquote className="text-sm leading-relaxed text-slate-700">{q}</blockquote>
              <figcaption className="mt-3 text-xs font-bold uppercase tracking-widest text-gold-deep">— {who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* NEWS */}
      <section className="mt-12" aria-label="Latest guides">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Rent news that affects your pocket</p>
            <h2 className="font-display mt-1 text-3xl text-ink">Latest stories</h2>
          </div>
          <Link href="/news" className="link-arrow shrink-0 text-sm font-semibold text-gold-deep">All news →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {news.map((n, i) => (
            <Link key={n.slug} href={`/news/${n.slug}`} className="card-hover block overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image src={["/images/area-estate.jpg", "/images/area-compound.jpg", "/images/area-interior.jpg"][i % 3]} alt="" width={600} height={300} className="h-36 w-full object-cover" />
              <span className="block p-5">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-deep">{n.date} · {n.readTime}</span>
                <span className="mt-1 block font-semibold text-ink">{n.title}</span>
                <span className="line-clamp-2 mt-1 block text-sm text-slate-600">{n.excerpt}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* RIGHTS + TRUST */}
      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-dashed border-gold-deep bg-white p-8">
          <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">{rightsCount} plain-language guides</p>
          <h2 className="font-display mt-1 text-3xl text-ink">Know your rights before you pay a cedi.</h2>
          <p className="mt-2 text-sm text-slate-600">The 6-month cap, eviction process, receipts, repairs — with Monday-morning action steps.</p>
          <Link href="/rights" className="btn-primary mt-5 inline-block rounded-lg bg-ink px-6 py-3 font-bold text-gold">Know your rights →</Link>
        </div>
        <div className="rounded-2xl bg-leaf p-8 text-white">
          <p className="section-eyebrow text-xs font-bold uppercase text-leaf-soft">The TrueCost promise</p>
          <h2 className="font-display mt-1 text-3xl">Every price carries a date. Stale figures get flagged — never hidden.</h2>
          <p className="mt-2 text-sm text-green-100">If a number goes stale, we say so — instead of letting you negotiate with bad data.</p>
          <Link href="/areas" className="mt-5 inline-block rounded-lg bg-white px-6 py-3 font-bold text-ink transition hover:bg-green-50">Check an area →</Link>
        </div>
      </section>

      <NewsletterStrip />
    </>
  );
}
