// P10 — About: mission + verification method + stats.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAreas, getNews, getRights } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "How TrueCost verifies Accra rent prices — and why every figure carries a date." };

export default function About() {
  const priceCount = getAreas().reduce((n, a) => n + a.prices.length, 0);
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <h1 className="font-display text-4xl text-ink">We publish the numbers landlords hope you never see.</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        TrueCost started from 46 documented renter complaints: 2-year advances, GH₵200 viewing fees for rooms that don't exist,
        photos that lie, and water that flows once a week. Every guide on this site answers the question portals won't:
        <b> what does it REALLY cost — and what is it REALLY like to live there?</b>
      </p>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8" aria-label="How verification works">
        <h2 className="font-display mb-6 text-center text-3xl text-ink">How verification works</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {[["📋", "Collect", "We pull asking prices from portals, agents, TikTok listings, and tenant reports across Accra."],
            ["🔍", "Cross-check", "Outliers are challenged; agent-inflated quotes are flagged against multiple sources."],
            ["✅", "Stamp", "Every dataset ships with a visible 'last verified' date — stale figures get flagged, never hidden."]].map(([i, t, d]) => (
            <li key={t} className="text-center">
              <p className="text-4xl">{i}</p>
              <h3 className="mt-2 font-bold text-ink">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-8 grid gap-4 text-center sm:grid-cols-4" aria-label="Coverage stats">
        {[[String(getAreas().length), "areas covered"], [String(priceCount), "benchmarks checked"], [String(getRights().length), "rights explained"], [String(getNews().length), "news stories"]].map(([n, l]) => (
          <div key={l} className="rounded-xl bg-ink p-6 text-white">
            <p className="font-display text-4xl text-gold">{n}</p>
            <p className="text-sm text-slate-300">{l}</p>
          </div>
        ))}
      </section>
      <section className="mt-8 rounded-2xl bg-ink p-8 text-center text-white">
        <h2 className="font-display text-2xl">Seen a wrong price? Correct us.</h2>
        <p className="mt-1 text-sm text-slate-300">Send the area and the figure — we'll re-verify within a week.</p>
        <Link href="/contact" className="btn-primary mt-4 inline-block rounded-lg bg-gold px-6 py-3 font-bold text-ink">Contact us →</Link>
      </section>
    </>
  );
}
