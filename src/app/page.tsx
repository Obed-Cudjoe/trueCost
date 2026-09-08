// P1 — Homepage: hero + search, popular areas, how-it-works, snapshot, calculator teaser, news, rights, newsletter.
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import AreaCard from "@/components/AreaCard";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getAreas, getNews } from "@/lib/content";

export default function Home() {
  const areas = getAreas();
  const news = getNews().slice(0, 3);
  return (
    <>
      {/* HERO */}
      <section className="rounded-2xl bg-ink px-6 py-14 text-center text-white md:py-20">
        <p className="mb-3 inline-block rounded-full border border-gold px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold">
          Accra rent intelligence
        </p>
        <h1 className="font-display mx-auto max-w-3xl text-4xl leading-tight md:text-5xl">
          Know the real cost of renting in Accra — before anyone quotes you a price.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Verified price benchmarks, water/power/transport realities, and a true move-in-cost calculator for every major neighbourhood.
        </p>
        <div className="mt-6 flex justify-center"><SearchBar large /></div>
        <p className="mt-4 text-sm text-slate-400">{areas.length} areas covered · 40+ prices checked · Updated quarterly</p>
      </section>

      {/* POPULAR AREAS */}
      <section className="mt-12" aria-label="Popular areas">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl text-ink">Popular areas</h2>
          <Link href="/areas" className="link-arrow text-sm font-semibold text-gold-deep">Browse all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.slice(0, 6).map((a) => <AreaCard key={a.slug} area={a} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8" aria-label="How it works">
        <h2 className="font-display mb-6 text-center text-3xl text-ink">Renting, without the guessing</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {[["1", "Check the benchmarks", "Real monthly ranges per room type, verified quarterly and date-stamped."],
            ["2", "Calculate your total", "Add the advance, the 10% agent cut, and hidden fees — before you commit."],
            ["3", "Get matched", "Tell us your area and budget. A human replies within 24 hours."]].map(([n, t, d]) => (
            <li key={n} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-xl font-bold text-gold">{n}</span>
              <h3 className="mt-3 font-bold text-ink">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CALCULATOR TEASER */}
      <section className="mt-12 rounded-2xl bg-gradient-to-r from-ink to-ink-soft p-8 text-center text-white">
        <h2 className="font-display text-3xl">What will <em className="text-gold">you</em> pay to move in?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">Advance + agent cut + hidden fees, computed from verified benchmarks. Thirty seconds, zero signup.</p>
        <Link href="/calculator" className="btn-primary mt-5 inline-block rounded-lg bg-gold px-6 py-3 font-bold text-ink">Open the calculator →</Link>
      </section>

      {/* NEWS */}
      <section className="mt-12" aria-label="Latest news">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl text-ink">Rent news</h2>
          <Link href="/news" className="link-arrow text-sm font-semibold text-gold-deep">All news →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {news.map((n) => (
            <Link key={n.slug} href={`/news/${n.slug}`} className="card-hover block rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">{n.date} · {n.readTime}</p>
              <h3 className="mt-1 font-semibold text-ink">{n.title}</h3>
              <p className="line-clamp-2 mt-1 text-sm text-slate-600">{n.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* RIGHTS TEASER */}
      <section className="mt-12 rounded-2xl border-2 border-dashed border-gold-deep bg-white p-8 text-center">
        <h2 className="font-display text-3xl text-ink">6 rights every Ghana tenant has — that nobody told you</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">The 6-month cap, eviction process, receipts, repairs — in plain language, with Monday-morning action steps.</p>
        <Link href="/rights" className="btn-primary mt-5 inline-block rounded-lg bg-ink px-6 py-3 font-bold text-gold">Know your rights →</Link>
      </section>

      <NewsletterStrip />
    </>
  );
}
