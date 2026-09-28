// P1 — Homepage: image hero + search + data notes, budget browse, areas, method, news,
// rights, trust + newsletter.
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import AreaCard from "@/components/AreaCard";
import NewsletterStrip from "@/components/NewsletterStrip";
import { formatDate, getAreas, getNews, getRights } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const BUDGETS = [
  { img: "/images/area-compound.jpg", name: "Lower ranges", desc: "Explore the lower recorded ranges across covered areas", href: "/areas" },
  { img: "/images/area-estate.jpg", name: "Mid ranges", desc: "Compare mid-range area benchmarks and living notes", href: "/areas" },
  { img: "/images/area-interior.jpg", name: "Higher ranges", desc: "See premium-area ranges, limitations, and questions to ask", href: "/areas" },
];

export default function Home() {
  const areas = getAreas();
  const news = getNews().slice(0, 3);
  const rightsCount = getRights().length;
  const priceCount = areas.reduce((n, a) => n + a.prices.length, 0);
  const checkLabels = [...new Set(areas.map((a) => a.lastVerified).filter(Boolean))];
  const latestCheck = checkLabels.length === 1 ? checkLabels[0] : checkLabels.length > 1 ? "See each page" : "Not recorded";

  return (
    <>
      <section className="hero-img relative overflow-hidden rounded-3xl" style={{ backgroundImage: "url(/images/hero-accra.jpg)" }}>
        <div className="hero-overlay px-6 py-16 text-center text-white md:py-24">
          <p className="rise section-eyebrow mb-4 inline-block rounded-full border border-gold/70 px-4 py-1 text-[11px] font-bold uppercase text-gold">
            Ghana&apos;s rent-truth finder
          </p>
          <h1 className="rise rise-1 font-display mx-auto max-w-3xl text-4xl leading-tight md:text-6xl">
            Find what it <em className="text-gold">really</em> costs to rent in Accra.
          </h1>
          <p className="rise rise-2 mx-auto mt-4 max-w-2xl text-slate-200">
            One search. Date-stamped benchmark ranges, living notes, and planning math — with the limits of the data shown before anyone quotes you a price.
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
          <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            {[[String(areas.length), "areas covered"], [String(priceCount), "benchmark rows"], [latestCheck, "latest check"]].map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-2xl text-gold md:text-3xl">{n}</dd>
                <dd className="text-xs text-slate-300">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5" aria-label="Benchmark data note">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-amber-900">Read the ranges carefully</p>
        <p className="mx-auto mt-2 max-w-3xl text-center text-sm text-slate-700">
          The current repository records monthly GH₵ ranges and month-level check labels, but not source URLs, sample sizes, or a reliable split between asking prices and confirmed rents paid. Each area page shows that limitation and flags older records.
        </p>
      </section>

      <section className="mt-12" aria-label="Browse by budget">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Start with your pocket</p>
        <h2 className="font-display mt-1 text-3xl text-ink">Browse by range</h2>
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

      <section className="mt-12" aria-label="Area guides">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Compare the collection</p>
            <h2 className="font-display mt-1 text-3xl text-ink">Area guides</h2>
          </div>
          <Link href="/areas" className="link-arrow shrink-0 text-sm font-semibold text-gold-deep">All areas →</Link>
        </div>
        <div className="swipe-row flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {areas.slice(0, 6).map((a) => (
            <div key={a.slug} className="w-72 shrink-0 md:w-auto"><AreaCard area={a} /></div>
          ))}
        </div>
      </section>

      <section className="dot-grid mt-12 rounded-3xl bg-ink px-6 py-12 text-white" aria-label="How it works">
        <p className="section-eyebrow text-center text-xs font-bold uppercase text-gold">Three steps to a clearer decision</p>
        <h2 className="font-display mt-1 text-center text-3xl">How TrueCost works</h2>
        <ol className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-3">
          {[["Search an area", "Open the benchmark range, living notes, FAQs, and limitations."],
            ["Plan the total", "Use the calculator with clearly labelled planning assumptions — not a quote."],
            ["Ask for help", "Send your area and budget for owner review; no outcome or response time is promised."]].map(([t, d], i) => (
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

      <section className="mt-12" aria-label="What is included">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Useful before you pay</p>
        <h2 className="font-display mt-1 text-3xl text-ink">Information, not invented certainty.</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ["📊", "Ranges with context", "Monthly GH₵ ranges are paired with the check label, source gaps, sample-size status, and stale-data warning."],
            ["🏘️", "Living questions", "Water, power, transport, and noise notes help you decide what to verify at the exact property."],
            ["⚖️", `${rightsCount} rights articles`, "Plain-language guidance shows the legal-source status and keeps a general-information disclaimer prominent."],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-3xl">{icon}</p>
              <h3 className="mt-2 font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-label="Latest guides">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Rent information</p>
            <h2 className="font-display mt-1 text-3xl text-ink">Latest stories</h2>
          </div>
          <Link href="/news" className="link-arrow shrink-0 text-sm font-semibold text-gold-deep">All news →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {news.map((n, i) => (
            <Link key={n.slug} href={`/news/${n.slug}`} className="card-hover block overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image src={["/images/area-estate.jpg", "/images/area-compound.jpg", "/images/area-interior.jpg"][i % 3]} alt="" width={600} height={300} className="h-36 w-full object-cover" />
              <span className="block p-5">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-deep">{formatDate(n.date)} · {n.readTime}</span>
                <span className="mt-1 block font-semibold text-ink">{n.title}</span>
                <span className="line-clamp-2 mt-1 block text-sm text-slate-600">{n.excerpt}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-dashed border-gold-deep bg-white p-8">
          <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">{rightsCount} published articles</p>
          <h2 className="font-display mt-1 text-3xl text-ink">Know what to document before you pay.</h2>
          <p className="mt-2 text-sm text-slate-600">Advance rent, eviction questions, receipts, repairs, and increases — with source status and a general-information disclaimer.</p>
          <Link href="/rights" className="btn-primary mt-5 inline-block rounded-lg bg-ink px-6 py-3 font-bold text-gold">Read tenant information →</Link>
        </div>
        <div className="rounded-2xl bg-leaf p-8 text-white">
          <p className="section-eyebrow text-xs font-bold uppercase text-leaf-soft">The TrueCost standard</p>
          <h2 className="font-display mt-1 text-3xl">Dates, assumptions, and gaps stay visible.</h2>
          <p className="mt-2 text-sm text-green-100">If a benchmark is old or its provenance is missing, the page says so instead of presenting certainty we cannot support.</p>
          <Link href="/areas" className="mt-5 inline-block rounded-lg bg-white px-6 py-3 font-bold text-ink transition hover:bg-green-50">Check an area →</Link>
        </div>
      </section>

      <NewsletterStrip />
    </>
  );
}
