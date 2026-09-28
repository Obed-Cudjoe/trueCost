import type { Provenance } from "@/lib/content";
import { formatDate } from "@/lib/content";

export default function SourceNote({ data, label = "Source and legal review" }: { data: Provenance; label?: string }) {
  const ownerReview = data.reviewStatus !== "documented";
  return (
    <section className={`mt-4 rounded-xl border p-4 text-sm ${ownerReview ? "border-amber-200 bg-amber-50 text-amber-950" : "border-green-200 bg-green-50 text-green-950"}`} aria-label={label}>
      <p className="font-bold">{ownerReview ? "⚠ Owner review required" : "✓ Source recorded"}</p>
      <p className="mt-1">
        {data.reviewNote || (ownerReview
          ? "The repository does not yet document a checked primary or reliable source for every claim on this page. Treat it as general information, not legal advice."
          : `The source record was checked ${data.checkedOn ? formatDate(data.checkedOn) : "on a date not recorded"}.`)}
      </p>
      {data.sources?.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {data.sources.map((source) => (
            <li key={source.url}>
              <a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
