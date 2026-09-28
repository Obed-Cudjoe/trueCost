// P3 — Area guide detail ★ primary landing + conversion page. Static-generated per area.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import BenchmarkTable from "@/components/BenchmarkTable";
import VerifiedStamp from "@/components/VerifiedStamp";
import DataTransparency from "@/components/DataTransparency";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedCards from "@/components/RelatedCards";
import NewsletterStrip from "@/components/NewsletterStrip";
import LeadForm from "@/components/LeadForm";
import FeaturedAgents from "@/components/FeaturedAgents";
import ApprovedReports from "@/components/ApprovedReports";
import { getAreas, getArea, getGuides } from "@/lib/content";
import { canonicalUrl } from "@/lib/site";

export async function generateStaticParams() {
  return getAreas().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArea(slug);
  if (!a) return {};
  return {
    title: `Renting in ${a.name}: 2026 planning guide`,
    description: `${a.summary} See the recorded date, price basis, and data limits before relying on the range.`,
    alternates: { canonical: `/areas/${a.slug}` },
  };
}

const ICONS: Record<string, string> = { water: "💧", power: "⚡", transport: "🚌", noise: "🔊" };

export default async function AreaDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();
  const areas = getAreas();
  const guides = getGuides();
  const related = [
    ...areas.filter((a) => a.slug !== slug).slice(0, 2).map((a) => ({ title: `📍 ${a.name}`, excerpt: a.summary, url: `/areas/${a.slug}` })),
    ...guides.slice(0, 1).map((g) => ({ title: g.title, excerpt: g.summary, url: `/guides/${g.slug}` })),
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "url": canonicalUrl(`/areas/${area.slug}`),
    mainEntity: area.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      {area.faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Areas", href: "/areas" }, { label: area.name }]} />
      <div className="hero-img relative overflow-hidden rounded-3xl" style={{ backgroundImage: "url(/images/hero-accra.jpg)" }}>
        <div className="hero-overlay px-6 py-10 md:px-10 md:py-14">
          <h1 className="font-display text-4xl text-white md:text-5xl">Renting in {area.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <VerifiedStamp date={area.lastVerified} provenanceComplete={Boolean(area.checkedOn && area.sourceType && typeof area.sampleSize === "number" && area.priceBasis && area.limitations?.length)} />
            <p className="text-slate-200">{area.tagline}</p>
          </div>
          <p className="mt-3 max-w-3xl text-slate-200">{area.summary}</p>
        </div>
      </div>

      <section className="mt-8" aria-label="Price benchmarks">
        <h2 className="font-display mb-3 text-2xl text-ink">Recorded price ranges</h2>
        <BenchmarkTable rows={area.prices} />
        <DataTransparency data={area} label="area benchmark" />
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href={`/calculator?area=${area.slug}`} className="block rounded-xl bg-ink p-5 text-center font-bold text-gold transition hover:bg-ink-soft">
          🧮 Plan move-in costs for {area.name} →
        </Link>
        <Link href={`/compare?mode=areas&a=${area.slug}`} className="block rounded-xl border-2 border-ink p-5 text-center font-bold text-ink transition hover:bg-white">
          ⚖️ Compare {area.name} with another area →
        </Link>
      </div>

      <section className="mt-8" aria-label="Compare room types in this area">
        <h2 className="font-display mb-3 text-2xl text-ink">Comparing room types inside {area.name}</h2>
        <p className="mb-3 max-w-3xl text-sm text-slate-600">
          Line up the room types recorded here side by side, or compare {area.name} with up to two other areas. Only fields that are actually
          recorded are shown.
        </p>
        <Link href={`/compare?mode=rooms&area=${area.slug}`} className="inline-block rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold">
          Compare room types in {area.name} →
        </Link>
      </section>

      <ApprovedReports areaSlug={area.slug} areaName={area.name} />

      <section className="mt-8" aria-label="Living realities">
        <h2 className="font-display mb-3 text-2xl text-ink">Living realities</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {area.realities.map((r) => (
            <div key={r.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-bold text-ink">{ICONS[r.icon]} {r.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="article-body mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: area.bodyHtml }} />

      <section className="mt-8 max-w-3xl" aria-label="FAQs">
        <h2 className="font-display mb-3 text-2xl text-ink">Common questions</h2>
        <FaqAccordion faqs={area.faqs} />
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6" aria-label="Get help">
        <h2 className="font-display text-2xl text-ink">Need help comparing an option in {area.name}?</h2>
        <p className="mb-4 text-sm text-slate-600">Send your area and budget for owner review. A property, partner, fee outcome, or response time is not guaranteed.</p>
        <LeadForm areas={areas.map((a) => ({ slug: a.slug, name: a.name }))} defaultArea={area.slug} compact />
      </section>

      <FeaturedAgents areaSlug={area.slug} areaName={area.name} />
      <RelatedCards items={related} />
      <NewsletterStrip />
    </>
  );
}
