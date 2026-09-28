// P2 — Area guide index (server: loads content, passes to client filter).
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import AreaFilter from "@/components/AreaFilter";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Area Guides",
  description: "Browse Accra area guides with date-stamped rent ranges, living notes, and data limitations.",
  alternates: { canonical: "/areas" },
};

export default function AreasIndex() {
  const areas = getAreas();
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Areas" }]} />
      <h1 className="font-display text-4xl text-ink">Every covered area, honestly labelled.</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Pick one to see recorded monthly ranges, living notes, FAQs, and the source limitations that still need review.</p>
      <AreaFilter areas={areas} />
      <NewsletterStrip />
    </>
  );
}
