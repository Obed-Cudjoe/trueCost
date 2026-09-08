// Area card — shared by homepage grid + /areas index.
import Link from "next/link";
import VerifiedStamp from "./VerifiedStamp";
import type { Area } from "@/lib/content";

const fmt = (n: number) => "GH₵" + n.toLocaleString("en-GH");

export default function AreaCard({ area }: { area: Area }) {
  const lo = Math.min(...area.prices.map((p) => p.min));
  const hi = Math.max(...area.prices.map((p) => p.max));
  return (
    <Link
      href={`/areas/${area.slug}`}
      className="card-hover block rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-display text-xl text-ink">📍 {area.name}</h3>
      </div>
      <p className="mb-3 text-sm text-slate-600">{area.tagline}</p>
      <p className="mb-3 text-sm font-bold text-ink">{fmt(lo)} – {fmt(hi)}<span className="font-normal text-slate-500"> /mo</span></p>
      <VerifiedStamp date={area.lastVerified} />
    </Link>
  );
}
