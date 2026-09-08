// P6 — News index with featured post.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getNews } from "@/lib/content";

export const metadata: Metadata = { title: "Rent News", description: "Rent news that affects your pocket — enforcement, fees, and market shifts in Accra." };

export default function NewsIndex() {
  const posts = getNews();
  const [featured, ...rest] = posts;
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "News" }]} />
      <h1 className="font-display text-4xl text-ink">Rent news that affects your pocket.</h1>
      {featured && (
        <Link href={`/news/${featured.slug}`} className="card-hover mt-6 block rounded-2xl bg-ink p-8 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Featured · {featured.date} · {featured.readTime}</p>
          <h2 className="font-display mt-2 text-3xl">{featured.title}</h2>
          <p className="mt-2 text-slate-300">{featured.excerpt}</p>
        </Link>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rest.map((n) => (
          <Link key={n.slug} href={`/news/${n.slug}`} className="card-hover block rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">{n.date} · {n.readTime}</p>
            <h2 className="mt-1 font-semibold text-ink">{n.title}</h2>
            <p className="line-clamp-2 mt-1 text-sm text-slate-600">{n.excerpt}</p>
          </Link>
        ))}
      </div>
      <NewsletterStrip />
    </>
  );
}
