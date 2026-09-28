// Partner listings — owner-reviewed properties from agents/landlords.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import NewsletterStrip from "@/components/NewsletterStrip";
import { LISTINGS } from "@/data/listings";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner Listings",
  description: "Public property submissions from TrueCost partners, shown only after owner review when available.",
  alternates: { canonical: "/listings" },
};

const fmt = (n: number) => "GH₵" + n.toLocaleString("en-GH");

export default function Listings() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Partner Listings" }]} />
      <h1 className="font-display text-4xl text-ink">Partner listings</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Property submissions from agents and landlords. A listing is shown only after the owner&apos;s review process; availability, ownership, price, and outcomes still need confirmation directly with the provider.
      </p>
      {LISTINGS.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-gold-deep bg-white p-10 text-center">
          <p className="text-4xl">🏘️</p>
          <h2 className="font-display mt-3 text-2xl text-ink">No public listings yet.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Reviewed properties will appear here when the owner publishes them. Renting? Submit a request for review. Letting? Submit a property.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/get-help" className="btn-primary rounded-lg bg-gold px-6 py-3 font-bold text-ink">Request help</Link>
            <Link href="/list-property" className="rounded-lg border-2 border-ink px-6 py-3 font-bold text-ink">Submit a property</Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {LISTINGS.map((l) => (
            <article key={l.id} className="card-hover rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">{l.areaName} · {l.type}</p>
                  <p className="font-display mt-1 text-3xl text-ink">{fmt(l.price)}<span className="text-base font-normal text-slate-500">/mo</span></p>
                  <p className="text-xs text-slate-500">Advance: {l.advance} · Added {l.added}</p>
                </div>
                <span className="shrink-0 rounded-full bg-leaf-soft px-2.5 py-1 text-[11px] font-bold text-leaf">✓ Owner-reviewed</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{l.description}</p>
              <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi TrueCost — I'm interested in the ${l.type} in ${l.areaName} (${fmt(l.price)}/mo).`)}`}
                target="_blank" rel="noreferrer" className="mt-4 block rounded-lg bg-ink px-4 py-2.5 text-center font-bold text-gold">
                Ask the provider to confirm →
              </a>
            </article>
          ))}
        </div>
      )}
      <NewsletterStrip />
    </>
  );
}
