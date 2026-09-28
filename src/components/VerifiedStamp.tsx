// Kept as the existing component name for compatibility; the visible label is now
// deliberately "Checked" rather than an unsupported verification promise.
import { isStale } from "@/lib/freshness";

export default function VerifiedStamp({ date, provenanceComplete = false }: { date?: string; provenanceComplete?: boolean }) {
  const stale = isStale(date);
  const label = date || "check date not recorded";
  const needsReview = stale === true || !provenanceComplete;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${needsReview ? "bg-amber-100 text-amber-900" : "bg-green-100 text-leaf"}`}>
      <span aria-hidden="true">{stale === true || !provenanceComplete ? "⚠" : "✓"}</span>
      {stale === true ? "Needs re-check" : !provenanceComplete ? "Checked · source details missing" : "Checked"} {label}
    </span>
  );
}
