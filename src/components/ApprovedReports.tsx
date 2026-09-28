"use client"; // Approved renter reports for one area — fetched from the public aggregate endpoint.
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatGhs } from "@/lib/benchmarks";
import type { ApprovedSummary } from "@/lib/reports";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function friendlyDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  return `${MONTHS[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
}

export default function ApprovedReports({ areaSlug, areaName }: { areaSlug: string; areaName: string }) {
  const [data, setData] = useState<ApprovedSummary | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`/api/reports/summary?area=${encodeURIComponent(areaSlug)}`)
      .then((res) => res.json())
      .then((json: { ok?: boolean } & Partial<ApprovedSummary>) => {
        if (cancelled) return;
        if (json?.ok && json.groups) {
          setData({ areaSlug: json.areaSlug ?? areaSlug, total: json.total ?? 0, groups: json.groups });
          setState("ready");
        } else {
          setState("error");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [areaSlug]);

  if (state === "loading") {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5" aria-label="Renter reports">
        <p className="text-sm text-slate-500">Checking for reviewed renter reports…</p>
      </section>
    );
  }

  if (state === "error") {
    return null; // Keep the page clean; the editorial benchmark remains the source of truth.
  }

  if (!data || data.total === 0) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5" aria-label="Renter reports">
        <h2 className="font-display text-xl text-ink">Renter-reported prices</h2>
        <p className="mt-1 text-sm text-slate-600">
          No renter report for {areaName} has passed review yet, so nothing is shown here. TrueCost will not fill the gap with an estimate.
        </p>
        <Link href={`/report?area=${areaSlug}`} className="mt-3 inline-block rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold">
          Report a price for {areaName} →
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5" aria-label="Renter-reported prices">
      <h2 className="font-display text-xl text-ink">Renter-reported prices for {areaName}</h2>
      <p className="mt-1 text-sm text-slate-700">
        {data.total} report{data.total === 1 ? "" : "s"} passed owner review. These are observations submitted by renters — not a verified
        benchmark, not a survey, and not a price trend.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Approved renter reports by room type</caption>
          <thead>
            <tr className="bg-ink text-gold">
              <th scope="col" className="px-4 py-3">Room type</th>
              <th scope="col" className="px-4 py-3">Reports</th>
              <th scope="col" className="px-4 py-3">Reported range</th>
              <th scope="col" className="px-4 py-3">Middle value</th>
              <th scope="col" className="px-4 py-3">Seen between</th>
              <th scope="col" className="px-4 py-3">Basis</th>
            </tr>
          </thead>
          <tbody>
            {data.groups.map((group) => (
              <tr key={group.roomType} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-ink">{group.roomType}</td>
                <td className="px-4 py-3">{group.count}</td>
                <td className="px-4 py-3 font-semibold">
                  {group.count === 1 ? formatGhs(group.min) : `${formatGhs(group.min)} – ${formatGhs(group.max)}`}
                </td>
                <td className="px-4 py-3">{group.count === 1 ? "—" : formatGhs(group.median)}</td>
                <td className="px-4 py-3">
                  {group.firstObserved === group.lastObserved
                    ? friendlyDate(group.firstObserved)
                    : `${friendlyDate(group.firstObserved)} – ${friendlyDate(group.lastObserved)}`}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {[
                    group.basisCounts.asking ? `${group.basisCounts.asking} asking` : "",
                    group.basisCounts.paid ? `${group.basisCounts.paid} paid` : "",
                    group.basisCounts.unknown ? `${group.basisCounts.unknown} unspecified` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-amber-950">
        Evidence limits: these are individual observations, the sample is small, and reporting dates are spread across the window shown. They
        sit alongside the editorial benchmark above and do not replace it, update it, or establish a trend.
      </p>
      <Link href={`/report?area=${areaSlug}`} className="mt-3 inline-block rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold">
        Add your own observation →
      </Link>
    </section>
  );
}
