// Report a price you actually saw. Stored privately, published only after review.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PriceReportForm from "@/components/PriceReportForm";
import { getAreas } from "@/lib/content";
import { getPublishedRoomTypes } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Report a rent price",
  description: "Tell TrueCost the rent you saw. Reports are stored privately and only appear on the site after owner review.",
  alternates: { canonical: "/report" },
};

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  const areas = getAreas().map((item) => ({ slug: item.slug, name: item.name }));
  const defaultArea = areas.some((item) => item.slug === area) ? (area as string) : "";

  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Report a price" }]} />
      <h1 className="font-display text-4xl text-ink">Report a rent price you saw</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        If a recorded range looks wrong, tell us what you were quoted or what you paid. Reports go into a private review queue — nothing is
        published automatically, and approved reports are always labelled as renter-reported rather than verified.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border-2 border-gold bg-white p-6 lg:col-span-2">
          <PriceReportForm areas={areas} roomTypes={getPublishedRoomTypes()} defaultArea={defaultArea} />
        </div>
        <aside className="h-fit rounded-2xl bg-ink p-6 text-white">
          <h2 className="font-bold text-gold">What happens next</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-300">
            <li>1. Your report is stored privately with the status <b className="text-white">pending</b>.</li>
            <li>2. The owner reviews it and can approve, reject, or ask for clarification.</li>
            <li>3. Only approved reports appear on an area page, with the date you saw the price and the evidence limits.</li>
          </ol>
          <h2 className="mt-5 font-bold text-gold">What we will not do</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            <li>• We do not publish your name, phone, or email.</li>
            <li>• We do not turn a single report into a “verified” benchmark.</li>
            <li>• We do not invent price trends from reports.</li>
          </ul>
          <p className="mt-5 text-xs text-slate-400">
            Nothing here is legal advice. For a dispute, keep every demand and receipt, then use the{" "}
            <Link href="/rights" className="underline">
              sourced tenant-rights pages
            </Link>
            .
          </p>
        </aside>
      </div>
    </>
  );
}
