// GET /api/reports/summary?area=slug — public, aggregated, approved-only.
// Returns counts and spreads. Never returns contact details, free-text context,
// pending rows, or anything that could be read as a verified benchmark.
import { NextRequest, NextResponse } from "next/server";
import { getAreas } from "@/lib/content";
import { cleanOneLine, getClientIp, rateLimit } from "@/lib/validate";
import { summariseApproved } from "@/lib/reports";
import { readRows } from "@/lib/db";

export const runtime = "nodejs";

const LIMITATIONS =
  "Renter-reported observations reviewed by the owner. Not a verified benchmark, not a survey, and not a price trend.";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`reports-summary:${ip}`, 60)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  const areaSlug = cleanOneLine(new URL(req.url).searchParams.get("area"), 80);
  if (!areaSlug || !getAreas().some((area) => area.slug === areaSlug)) {
    return NextResponse.json({ ok: false, error: "Unknown area." }, { status: 404 });
  }

  try {
    const rows = await readRows("price_reports", 500);
    const summary = summariseApproved(rows, areaSlug);
    return NextResponse.json(
      { ok: true, ...summary, limitations: LIMITATIONS },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Summary unavailable." }, { status: 500 });
  }
}
