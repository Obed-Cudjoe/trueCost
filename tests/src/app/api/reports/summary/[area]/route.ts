// GET /api/reports/summary/<area-slug> — public, aggregated, approved-only.
//
// The area is part of the PATH, not a query string: Netlify's CDN keyed the old
// ?area= version on the path alone, so every area was served the first cached
// summary. A path segment keeps one cache entry per area, and no-store keeps
// the response out of shared caches entirely.
import { NextRequest, NextResponse } from "next/server";
import { getAreas } from "@/lib/content";
import { cleanOneLine, getClientIp, rateLimit } from "@/lib/validate";
import { summariseApproved } from "@/lib/reports";
import { readRows } from "@/lib/db";

export const runtime = "nodejs";

const LIMITATIONS =
  "Renter-reported observations reviewed by the owner. Not a verified benchmark, not a survey, and not a price trend.";

const HEADERS = {
  "Cache-Control": "private, no-store, must-revalidate",
  "Netlify-Vary": "query=__nextDataReq|_rsc",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ area: string }> }) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`reports-summary:${ip}`, 60)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429, headers: HEADERS });
  }

  const { area: rawArea } = await params;
  const areaSlug = cleanOneLine(decodeURIComponent(rawArea ?? ""), 80);
  if (!areaSlug || !getAreas().some((area) => area.slug === areaSlug)) {
    return NextResponse.json({ ok: false, error: "Unknown area." }, { status: 404, headers: HEADERS });
  }

  try {
    const rows = await readRows("price_reports", 500);
    const summary = summariseApproved(rows, areaSlug);
    return NextResponse.json({ ok: true, ...summary, limitations: LIMITATIONS }, { headers: HEADERS });
  } catch {
    return NextResponse.json({ ok: false, error: "Summary unavailable." }, { status: 500, headers: HEADERS });
  }
}
