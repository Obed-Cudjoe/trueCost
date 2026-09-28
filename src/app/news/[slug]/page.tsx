// P7 — News article. Static-generated.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import SourceNote from "@/components/SourceNote";
import RelatedCards from "@/components/RelatedCards";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getNews, getNewsPost, getAreas, formatDate } from "@/lib/content";

export async function generateStaticParams() {
  return getNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = getNewsPost(slug);
  if (!n) return {};
  return { title: n.title, description: n.excerpt, alternates: { canonical: `/news/${n.slug}` } };
}

export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getNewsPost(slug);
  if (!post) notFound();
  const areas = getAreas();
  const related = areas.slice(0, 3).map((a) => ({ title: `📍 ${a.name}`, excerpt: a.summary, url: `/areas/${a.slug}` }));
  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: post.title.slice(0, 32) + "…" }]} />
      <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">{formatDate(post.date)} · {post.readTime}</p>
      <h1 className="font-display mt-2 text-4xl text-ink">{post.title}</h1>
      <SourceNote data={post} label="Article source status" />
      <div className="article-body mt-4" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map((t) => <span key={t} className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-gold-deep">#{t}</span>)}
      </div>
      <p className="mt-6"><Link href="/news" className="font-semibold text-gold-deep hover:underline">← All news</Link></p>
      <RelatedCards items={related} heading="Check the benchmarks" />
      <NewsletterStrip />
    </article>
  );
}
