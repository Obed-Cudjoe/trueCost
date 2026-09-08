// P9 — Rights article: law box + action checklist + FAQs. Static-generated.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedCards from "@/components/RelatedCards";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getRights, getRightsArticle, getAreas } from "@/lib/content";

export async function generateStaticParams() {
  return getRights().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRightsArticle(slug);
  if (!r) return {};
  return { title: r.title, description: r.summary };
}

export default async function RightsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getRightsArticle(slug);
  if (!article) notFound();
  const related = getAreas().slice(0, 3).map((a) => ({ title: `📍 ${a.name}`, excerpt: a.summary, url: `/areas/${a.slug}` }));
  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Rights", href: "/rights" }, { label: article.title.slice(0, 32) + "…" }]} />
      <h1 className="font-display text-4xl text-ink">{article.title}</h1>
      <div className="mt-4 rounded-xl bg-ink p-5 text-white" role="note" aria-label="What the law says">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">What the law says</p>
        <p className="mt-1 text-sm leading-relaxed">{article.lawBox}</p>
      </div>
      <div className="article-body mt-4" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5" aria-label="Action checklist">
        <h2 className="font-display text-xl text-ink">✅ Your Monday-morning checklist</h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-700">
          {article.steps.map((s, i) => <li key={s}><b className="text-gold-deep">{i + 1}.</b> {s}</li>)}
        </ol>
      </section>
      <section className="mt-8" aria-label="FAQs">
        <h2 className="font-display mb-3 text-2xl text-ink">Follow-up questions</h2>
        <FaqAccordion faqs={article.faqs} />
      </section>
      <RelatedCards items={related} heading="Benchmark your area" />
      <NewsletterStrip />
    </article>
  );
}
