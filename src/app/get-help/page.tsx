// P12 — Get-help lead page ★ primary conversion. Accepts ?area= prefill.
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import { getAreas } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Get Matched", description: "Tell us your area and budget — get matched to verified rental options within 24 hours. Free." };

export default async function GetHelp({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  const areas = getAreas();
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Get Matched" }]} />
      <h1 className="font-display text-4xl text-ink">Tell us what you need — get matched {SITE.responsePromise}.</h1>
      <ul className="mt-3 space-y-1 text-slate-700">
        {["No viewing fees through us.", "No spam — your number stays private.", "Matched to verified options in your budget."].map((t) => (
          <li key={t} className="flex gap-2"><span className="text-leaf">✓</span>{t}</li>
        ))}
      </ul>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border-2 border-gold bg-white p-6 lg:col-span-2">
          <LeadForm areas={areas.map((a) => ({ slug: a.slug, name: a.name }))} defaultArea={area ?? ""} />
        </div>
        <aside className="h-fit rounded-2xl bg-ink p-6 text-white">
          <h2 className="font-bold text-gold">Faster? WhatsApp us.</h2>
          <p className="mt-1 text-sm text-slate-300">One tap, prefilled message, human reply.</p>
          <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi TrueCost — help me find a room.")}`} target="_blank" rel="noreferrer"
            className="mt-4 block rounded-lg bg-[#25D366] px-4 py-3 text-center font-bold text-ink">✆ WhatsApp now</a>
          <p className="mt-4 text-xs text-slate-400">🔒 Your details are only used to match you. Never sold.</p>
        </aside>
      </div>
    </>
  );
}
