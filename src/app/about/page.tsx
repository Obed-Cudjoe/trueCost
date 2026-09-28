// P10 — About: mission + data method + dynamic coverage stats.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAreas, getNews, getRights } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "How TrueCost labels Accra rent benchmarks, sources, limitations, and freshness.",
  alternates: { canonical: "/about" },
};

export default function About() {
  const areas = getAreas();
  const priceCount = areas.reduce((n, a) => n + a.prices.length, 0);
  const rights = getRights();
  const news = getNews();
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <h1 className="font-display text-4xl text-ink">Rent information with the limits left visible.</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        TrueCost helps renters compare Accra neighbourhoods, understand move-in planning costs, and find practical questions to ask
        before paying. We keep the current editorial dataset date-stamped, but do not turn an undocumented source or estimate into a
        claim of confirmed market truth.
      </p>
      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6" aria-label="Current data limitations">
        <h2 className="font-display text-2xl text-ink">What the repository currently records</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Area and property-type pages contain monthly GH₵ ranges and a month-level check label. The repository does not yet record
          source URLs, source type, sample size, or whether each figure is an asking price or a confirmed rent paid. On this build, “Checked” means that a date label exists in the content file; it does not mean independent verification. Those gaps are shown on the relevant pages and need owner review before the figures are described as representative or fully verified.
        </p>
      </section>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8" aria-label="How dates and claims work">
        <h2 className="font-display mb-6 text-center text-3xl text-ink">How the labels work</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            ["📋", "Record", "Each benchmark page shows the date label that exists in the content file. A month without a day is labelled as month-only."],
            ["🔍", "Disclose", "Source type, price basis, sample size, and limitations are shown when recorded. Missing provenance is not silently filled in."],
            ["⚠️", "Flag", "A 90-day freshness threshold produces a visible re-check warning. A stale figure stays visible only with that warning."],
          ].map(([i, t, d]) => (
            <li key={t} className="text-center">
              <p className="text-4xl">{i}</p>
              <h3 className="mt-2 font-bold text-ink">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-8 grid gap-4 text-center sm:grid-cols-4" aria-label="Coverage stats">
        {[[String(areas.length), "areas covered"], [String(priceCount), "benchmark rows"], [String(rights.length), "rights articles"], [String(news.length), "news stories"]].map(([n, l]) => (
          <div key={l} className="rounded-xl bg-ink p-6 text-white">
            <p className="font-display text-4xl text-gold">{n}</p>
            <p className="text-sm text-slate-300">{l}</p>
          </div>
        ))}
      </section>
      <section className="mt-8 rounded-2xl bg-ink p-8 text-center text-white">
        <h2 className="font-display text-2xl">Seen a wrong price or unsupported claim?</h2>
        <p className="mt-1 text-sm text-slate-300">Send the page and the evidence you have. We will review it when possible; no response time is promised.</p>
        <Link href="/contact" className="btn-primary mt-4 inline-block rounded-lg bg-gold px-6 py-3 font-bold text-ink">Contact us →</Link>
      </section>
    </>
  );
}
