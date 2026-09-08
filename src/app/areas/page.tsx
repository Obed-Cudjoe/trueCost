// P2 — Area guide index (server: loads content, passes to client filter).
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import AreaFilter from "@/components/AreaFilter";
import NewsletterStrip from "@/components/NewsletterStrip";
import { getAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Area Guides",
  description: "Browse every covered Accra area with verified price benchmarks and living realities.",
};

export default function AreasIndex() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Areas" }]} />
      <h1 className="font-display text-4xl text-ink">Every covered area, honestly priced.</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Pick one to see benchmarks, living realities, and FAQs — all verified and date-stamped.</p>
      <AreaFilter areas={getAreas()} />
      <NewsletterStrip />
    </>
  );
}
