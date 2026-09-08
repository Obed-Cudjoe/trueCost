// R7 — related content cards (guides/areas/news/rights).
import Link from "next/link";

export interface Related { title: string; excerpt: string; url: string }

export default function RelatedCards({ items, heading = "Keep exploring" }: { items: Related[]; heading?: string }) {
  if (!items.length) return null;
  return (
    <section aria-label={heading} className="mt-12">
      <h2 className="font-display mb-4 text-2xl text-ink">{heading}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((r) => (
          <Link key={r.url} href={r.url} className="card-hover block rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 font-semibold text-ink">{r.title}</h3>
            <p className="line-clamp-2 text-sm text-slate-600">{r.excerpt}</p>
            <span className="link-arrow mt-2 inline-block text-sm font-semibold text-gold-deep">Read →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
