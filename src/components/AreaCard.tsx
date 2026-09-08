// Area card — image header + price + stamp. Shared by homepage + /areas index.
import Link from "next/link";
import Image from "next/image";
import VerifiedStamp from "./VerifiedStamp";
import type { Area } from "@/lib/content";

const fmt = (n: number) => "GH₵" + n.toLocaleString("en-GH");
const IMGS = ["/images/area-estate.jpg", "/images/area-compound.jpg", "/images/area-interior.jpg"];

export default function AreaCard({ area }: { area: Area }) {
  const lo = Math.min(...area.prices.map((p) => p.min));
  const hi = Math.max(...area.prices.map((p) => p.max));
  const img = IMGS[area.slug.length % IMGS.length]; // stable image per area
  return (
    <Link href={`/areas/${area.slug}`} className="card-hover block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <span className="relative block h-36">
        <Image src={img} alt={area.name} fill className="object-cover" sizes="(max-width: 768px) 300px, 400px" />
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold text-gold backdrop-blur">
          {fmt(lo)} – {fmt(hi)}<span className="font-normal"> /mo</span>
        </span>
      </span>
      <span className="block p-4">
        <span className="font-display block text-xl text-ink">📍 {area.name}</span>
        <span className="line-clamp-1 mt-0.5 block text-sm text-slate-600">{area.tagline}</span>
        <span className="mt-2 block"><VerifiedStamp date={area.lastVerified} /></span>
      </span>
    </Link>
  );
}
