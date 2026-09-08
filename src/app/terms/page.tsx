// P15b — Terms of use (CMS-managed legal template).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLegal } from "@/lib/content";

export const metadata: Metadata = { title: "Terms of Use", description: "TrueCost terms of use in plain words." };

export default function Terms() {
  const doc = getLegal("terms");
  if (!doc) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Terms" }]} />
      <h1 className="font-display text-4xl text-ink">{doc.title}</h1>
      <p className="mt-1 text-sm text-slate-500">Last updated: {doc.updated}</p>
      <div className="article-body mt-4" dangerouslySetInnerHTML={{ __html: doc.bodyHtml }} />
    </article>
  );
}
