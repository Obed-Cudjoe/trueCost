// P15a — Privacy policy (CMS-managed legal template).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatDate, getLegal } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy Policy", description: "TrueCost privacy policy in plain words.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  const doc = getLegal("privacy");
  if (!doc) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
      <h1 className="font-display text-4xl text-ink">{doc.title}</h1>
      <p className="mt-1 text-sm text-slate-500">Last updated: {doc.updated}</p>
      <div className="article-body mt-4" dangerouslySetInnerHTML={{ __html: doc.bodyHtml }} />
    </article>
  );
}
