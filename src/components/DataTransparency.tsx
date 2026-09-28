import {
  DATA_FRESHNESS_DAYS,
  hasCompleteBenchmarkProvenance,
  isMonthOnlyDate,
  isStale,
  type Provenance,
} from "@/lib/content";

function sourceLabel(data: Provenance): string {
  return data.sourceType || "Not recorded in the current dataset";
}

function sampleLabel(data: Provenance): string {
  return typeof data.sampleSize === "number" ? String(data.sampleSize) : "Not recorded";
}

function basisLabel(data: Provenance): string {
  if (data.priceBasis === "asking") return "Asking prices";
  if (data.priceBasis === "paid") return "Confirmed rents paid";
  if (data.priceBasis === "mixed") return "Mixed asking and paid-rent records";
  return "Not recorded — do not assume these are confirmed rents paid";
}

export default function DataTransparency({ data, label = "Benchmark data" }: { data: Provenance; label?: string }) {
  const checkedLabel = data.checkedOn || data.lastVerified;
  const stale = isStale(checkedLabel);
  const complete = hasCompleteBenchmarkProvenance(data);
  const monthOnly = !data.checkedOn && isMonthOnlyDate(data.lastVerified);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-label={`${label} notes`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">Data note</p>
          <h2 className="font-display mt-1 text-xl text-ink">How to read this {label.toLowerCase()}</h2>
        </div>
        {stale === true ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">⚠ Needs a fresh check</span>
        ) : stale === null ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">⚠ Check date missing</span>
        ) : (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-leaf">✓ Within {DATA_FRESHNESS_DAYS}-day freshness window</span>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        The figures shown here are monthly GH₵ ranges recorded in TrueCost&apos;s editorial dataset. They are not a quote,
        a survey result, or proof of what a tenant actually paid. The dataset distinguishes asking prices from confirmed
        paid rents only when the record below says so.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-ink">Last checked</dt>
          <dd className="text-slate-600">{checkedLabel || "Not recorded"}{monthOnly ? " (month recorded; day not recorded)" : ""}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Source type</dt>
          <dd className="text-slate-600">{sourceLabel(data)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Price basis</dt>
          <dd className="text-slate-600">{basisLabel(data)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Sample size</dt>
          <dd className="text-slate-600">{sampleLabel(data)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-slate-600">
        <b className="text-ink">Limitations:</b>{" "}
        {data.limitations?.length ? data.limitations.join(" ") : "Source URLs, source-level sample size, and the asking-price versus paid-rent split are not recorded in the current repository."}
      </p>
      {!complete && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Owner review is still needed before this dataset is described as representative, cross-checked, or fully verified.
        </p>
      )}
      {stale === true && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          This record is older than the site&apos;s {DATA_FRESHNESS_DAYS}-day freshness threshold. Confirm the current price and conditions before paying or travelling.
        </p>
      )}
    </section>
  );
}
