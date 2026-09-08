// P8 — Rent rights index: 6 rights cards + how-to-file steps.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getRights } from "@/lib/content";

export const metadata: Metadata = { title: "Tenant Rights", description: "The rights every Ghana tenant has — 6-month cap, eviction process, receipts, repairs — in plain language." };

const ICONS = ["🛡️", "🔑", "📈", "🧾", "🔧"];

export default function RightsIndex() {
  const rights = getRights();
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Rights" }]} />
      <h1 className="font-display text-4xl text-ink">6 rights every Ghana tenant has — that nobody told you.</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Plain language, Monday-morning action steps, and the exact law behind each one.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rights.map((r, i) => (
          <Link key={r.slug} href={`/rights/${r.slug}`} className="card-hover block rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-3xl">{ICONS[i % ICONS.length]}</p>
            <h2 className="mt-2 font-semibold text-ink">{r.title}</h2>
            <p className="line-clamp-2 mt-1 text-sm text-slate-600">{r.summary}</p>
          </Link>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6" aria-label="How to file">
        <h2 className="font-display text-2xl text-ink">How to file at Rent Control (4 steps)</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-4">
          {["Get the demand in writing", "Gather receipts + messages", "File at rentcontrol.mwh.gov.gh", "Attend mediation with your evidence pack"].map((s, i) => (
            <li key={s} className="rounded-xl bg-cream p-4 text-sm"><b className="text-gold-deep">Step {i + 1}.</b> {s}</li>
          ))}
        </ol>
      </section>
      <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-slate-700">⚖️ General guidance, not legal advice. For live disputes, consult a Ghana Bar Association lawyer.</p>
      <NewsletterStrip />
    </>
  );
}
