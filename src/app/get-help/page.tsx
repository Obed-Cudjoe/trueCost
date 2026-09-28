// P12 — Get-help lead page. Accepts ?area= prefill.
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import { getAreas } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get Help",
  description: "Tell TrueCost your area and budget so the owner can review your rental request.",
  alternates: { canonical: "/get-help" },
};

export default async function GetHelp({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  const areas = getAreas();
  const defaultArea = area && areas.some((item) => item.slug === area) ? area : "";
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Get Help" }]} />
      <h1 className="font-display text-4xl text-ink">Tell us what you need.</h1>
      <p className="mt-2 max-w-2xl text-slate-600">This form records your area and budget for owner review. A match, fee outcome, or response time is not guaranteed.</p>
      <ul className="mt-4 space-y-1 text-sm text-slate-700">
        {["Only submit details you are comfortable storing for this request.", "The form is separate from the newsletter; it does not subscribe you.", "We cannot promise a property, partner, or outcome."].map((t) => (
          <li key={t} className="flex gap-2"><span className="text-leaf">✓</span>{t}</li>
        ))}
      </ul>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border-2 border-gold bg-white p-6 lg:col-span-2">
          <LeadForm areas={areas.map((a) => ({ slug: a.slug, name: a.name }))} defaultArea={defaultArea} />
        </div>
        <aside className="h-fit rounded-2xl bg-ink p-6 text-white">
          <h2 className="font-bold text-gold">Prefer WhatsApp?</h2>
          <p className="mt-1 text-sm text-slate-300">Send a direct message instead of using the form.</p>
          <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi TrueCost — I need help finding a room.")}`} target="_blank" rel="noreferrer"
            className="mt-4 block rounded-lg bg-[#25D366] px-4 py-3 text-center font-bold text-ink">✆ WhatsApp</a>
          <p className="mt-4 text-xs text-slate-400">Your form details remain in the private server-side submission store.</p>
        </aside>
      </div>
    </>
  );
}
