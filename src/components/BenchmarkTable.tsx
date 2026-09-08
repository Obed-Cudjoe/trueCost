// R4 — price benchmark table. Horizontal scroll on mobile.
import type { PriceRow } from "@/lib/content";

const fmt = (n: number) => "GH₵" + n.toLocaleString("en-GH");

export default function BenchmarkTable({ rows }: { rows: PriceRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="bg-ink text-gold">
            <th className="px-4 py-3">Room type</th>
            <th className="px-4 py-3">Monthly range</th>
            <th className="px-4 py-3">Advance norm</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.type} className="border-t border-slate-100 odd:bg-cream">
              <td className="px-4 py-3 font-medium text-ink">{r.type}</td>
              <td className="px-4 py-3 font-semibold">{fmt(r.min)} – {fmt(r.max)}</td>
              <td className="px-4 py-3 text-slate-600">{r.advance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
