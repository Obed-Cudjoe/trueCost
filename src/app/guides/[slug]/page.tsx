// P4 — Property-type guide detail. Static-generated.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import VerifiedStamp from "@/components/VerifiedStamp";
import DataTransparency from "@/components/DataTransparency";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedCards from "@/components/RelatedCards";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getGuides, getGuide, getAreas } from "@/lib/content";

export async function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return { title: `${g.title} in Accra — Prices by Area`, description: `${g.summary} See the source limitations before relying on a range.`, alternates: { canonical: `/guides/${g.slug}` } };
}

export default async function GuideDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const areas = getAreas();
  const related = areas.slice(0, 3).map((a) => ({ title: `📍 ${a.name}`, excerpt: a.summary, url: `/areas/${a.slug}` }));

  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Guides" }, { label: guide.title }]} />
      <h1 className="font-display text-4xl text-ink">{guide.title}</h1>
      <div className="mt-2"><VerifiedStamp date={guide.lastVerified} provenanceComplete={Boolean(guide.checkedOn && guide.sourceType && typeof guide.sampleSize === "number" && guide.priceBasis && guide.limitations?.length)} /></div>
      <p className="mt-3 max-w-3xl text-slate-700">{guide.summary}</p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6" aria-label="What it means">
        <h2 className="font-display mb-3 text-2xl text-ink">What it actually means</h2>
        <ul className="space-y-2 text-slate-700">
          {guide.layout.map((l) => <li key={l} className="flex gap-2"><span className="text-leaf">✓</span>{l}</li>)}
        </ul>
      </section>

      <section className="mt-8" aria-label="Prices by area">
        <h2 className="font-display mb-3 text-2xl text-ink">Recorded ranges by area</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[420px] text-left text-sm">
            <caption className="sr-only">Monthly range by area in Ghana cedis</caption>
            <thead><tr className="bg-ink text-gold"><th className="px-4 py-3">Area</th><th className="px-4 py-3">Monthly range</th></tr></thead>
            <tbody>
              {guide.priceByArea.map((r) => (
                <tr key={r.area} className="border-t border-slate-100 odd:bg-cream">
                  <td className="px-4 py-3 font-medium text-ink">{r.area}</td>
                  <td className="px-4 py-3 font-semibold">{r.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DataTransparency data={guide} label="property-type benchmark" />
      </section>

      <div className="mt-6 rounded-xl border-l-4 border-gold-deep bg-amber-50 p-5" role="note">
        <p className="font-bold text-ink">⚠️ Advance note</p>
        <p className="mt-1 text-sm text-slate-700">{guide.warning}</p>
      </div>

      <div className="article-body mt-6 max-w-3xl" dangerouslySetInnerHTML={{ __html: guide.bodyHtml }} />

      <section className="mt-8 max-w-3xl" aria-label="FAQs">
        <h2 className="font-display mb-3 text-2xl text-ink">Common questions</h2>
        <FaqAccordion faqs={guide.faqs} />
      </section>

      <Link href="/calculator" className="mt-8 block rounded-xl bg-ink p-5 text-center font-bold text-gold transition hover:bg-ink-soft">
        🧮 Plan your move-in cost →
      </Link>

      <RelatedCards items={related} heading="Compare areas" />
      <NewsletterStrip />
    </>
  );
}
