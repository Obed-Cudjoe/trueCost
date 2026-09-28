// List-your-property — partner acquisition page: submission form + pricing.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PartnerForm from "@/components/PartnerForm";
import { getAreas } from "@/lib/content";
import { SITE, PARTNER_PRICING } from "@/lib/site";

export const metadata: Metadata = {
  title: "List Your Property",
  description: "Submit a vacant property for owner review on TrueCost. Publishing and renter matches are not guaranteed.",
  alternates: { canonical: "/list-property" },
};

export default function ListProperty() {
  const areas = getAreas();
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "List Your Property" }]} />
      <div className="dot-grid rounded-3xl bg-ink px-6 py-10 md:px-10">
        <p className="section-eyebrow text-xs font-bold uppercase text-gold">For agents · landlords · developers</p>
        <h1 className="font-display mt-1 text-4xl text-white md:text-5xl">Submit a vacant property for review.</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Send the details below. The owner reviews submissions before anything is published; a listing, renter match, or response time is not guaranteed.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border-2 border-gold bg-white p-6 lg:col-span-2">
          <h2 className="font-display mb-4 text-2xl text-ink">Submit your property</h2>
          <PartnerForm areas={areas.map((a) => ({ slug: a.slug, name: a.name }))} />
        </div>
        <div className="space-y-4">
          <aside className="rounded-2xl bg-ink p-6 text-white">
            <h2 className="font-bold text-gold">Published pricing plan</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between border-b border-ink-line pb-2"><span>Submission fee</span><b className="text-leaf-soft">{PARTNER_PRICING.listing}</b></li>
              <li className="flex justify-between border-b border-ink-line pb-2"><span>First {PARTNER_PRICING.freeMatches} renter matches</span><b className="text-leaf-soft">Free</b></li>
              <li className="flex justify-between border-b border-ink-line pb-2"><span>Per match after</span><b>{PARTNER_PRICING.perMatch}</b></li>
              <li className="flex justify-between border-b border-ink-line pb-2"><span>Monthly flow</span><b>{PARTNER_PRICING.monthly}</b></li>
              <li className="flex justify-between"><span>Featured slot / area</span><b>{PARTNER_PRICING.featured}/mo</b></li>
            </ul>
            <p className="mt-3 text-xs text-slate-400">Pricing describes the intended plan, not a promise of leads, publication, or outcomes.</p>
            <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi TrueCost — I want to submit a property.")}`} target="_blank" rel="noreferrer"
              className="mt-4 block rounded-lg bg-[#25D366] px-4 py-3 text-center font-bold text-ink">✆ WhatsApp</a>
          </aside>
          <aside className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-ink">How it works</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li><b className="text-gold-deep">1.</b> You submit the property details.</li>
              <li><b className="text-gold-deep">2.</b> The owner reviews the submission.</li>
              <li><b className="text-gold-deep">3.</b> If approved, it may appear in the public listings collection.</li>
            </ol>
            <p className="mt-4 text-sm"><Link href="/listings" className="font-semibold text-gold-deep">See the public listings collection →</Link></p>
          </aside>
        </div>
      </div>
    </>
  );
}
