// Partner-directory slot for area guides. Empty areas show the submission card.
import Link from "next/link";
import { agentsFor } from "@/data/agents";
import { PARTNER_PRICING } from "@/lib/site";

export default function FeaturedAgents({ areaSlug, areaName }: { areaSlug: string; areaName: string }) {
  const agents = agentsFor(areaSlug);
  return (
    <section className="mt-10" aria-label={`Partner directory for ${areaName}`}>
      <p className="section-eyebrow text-xs font-bold uppercase text-gold-deep">Work with someone local</p>
      <h2 className="font-display mt-1 text-2xl text-ink">Partner directory: {areaName}</h2>
      <p className="mt-1 text-sm text-slate-600">Partner status is commercial, not a guarantee of licensing, availability, price, or outcome. Confirm details directly.</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {agents.map((a) => (
          <div key={a.name} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-ink">🏢 {a.name}</h3>
              <span className="rounded-full bg-leaf-soft px-2.5 py-1 text-[11px] font-bold text-leaf">Partner since {a.since}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{a.tagline}</p>
            <Link href={`/get-help?area=${areaSlug}`} className="mt-3 inline-block rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold">
              Request an introduction →
            </Link>
          </div>
        ))}
        <Link href="/list-property" className="card-hover block rounded-2xl border-2 border-dashed border-gold-deep bg-amber-50 p-5">
          <h3 className="font-bold text-ink">📌 Your agency here — {PARTNER_PRICING.featured}/mo</h3>
          <p className="mt-1 text-sm text-slate-600">Submit a partner request for the commercial slot. Publication and renter introductions are not guaranteed.</p>
          <span className="mt-3 inline-block text-sm font-bold text-gold-deep">Submit a request →</span>
        </Link>
      </div>
    </section>
  );
}
