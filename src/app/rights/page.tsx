// P8 — Rent rights index: dynamically counts the published articles + evidence checklist.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import NewsletterStrip from "@/components/NewsletterStrip";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { getRights } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tenant Rights",
  description: "Plain-language Ghana tenant information with source status and a prominent general-information disclaimer.",
  alternates: { canonical: "/rights" },
};

const ICONS = ["🛡️", "🔑", "📈", "🧾", "🔧"];

export default function RightsIndex() {
  const rights = getRights();
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Rights" }]} />
      <h1 className="font-display text-4xl text-ink">{rights.length} tenant information guides — with the gaps shown.</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Plain language and practical evidence steps. Each article shows whether a checked legal source is recorded.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rights.map((r, i) => (
          <Link key={r.slug} href={`/rights/${r.slug}`} className="card-hover block rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-3xl">{ICONS[i % ICONS.length]}</p>
            <h2 className="mt-2 font-semibold text-ink">{r.title}</h2>
            <p className="line-clamp-2 mt-1 text-sm text-slate-600">{r.summary}</p>
            <p className={`mt-3 text-xs font-bold ${r.reviewStatus === "documented" ? "text-leaf" : "text-amber-800"}`}>
              {r.reviewStatus === "documented" ? "✓ Source recorded" : "⚠ Owner review required"}
            </p>
          </Link>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6" aria-label="Evidence checklist">
        <h2 className="font-display text-2xl text-ink">Before you file or pay</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-4">
          {["Get the demand in writing", "Gather receipts + messages", "Use the official Rent Control portal", "Take your evidence to a qualified adviser"].map((s, i) => (
            <li key={s} className="rounded-xl bg-cream p-4 text-sm"><b className="text-gold-deep">Step {i + 1}.</b> {s}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-slate-600">Official portal: <a className="font-semibold text-gold-deep underline" href="https://rentcontrol.mwh.gov.gh/" target="_blank" rel="noreferrer">Rent Control Online Portal</a>.</p>
      </section>
      <LegalDisclaimer />
      <NewsletterStrip />
    </>
  );
}
