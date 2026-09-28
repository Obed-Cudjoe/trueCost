// POST /api/leads — lead capture. Validates → stores → optionally notifies owner.
import { NextRequest, NextResponse } from "next/server";
import { BUDGETS } from "@/lib/site";
import { getAreas } from "@/lib/content";
import { adminKeyIsValid } from "@/lib/admin";
import { asString, cleanOneLine, getClientIp, rateLimit, safeSourcePage, turnstileOk, validGhPhone } from "@/lib/validate";
import { insertRow, readRows } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 20_000;
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(req: NextRequest) {
  if (!adminKeyIsValid(req)) return NextResponse.json({ ok: false }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    return NextResponse.json({ ok: true, rows: await readRows("leads") }, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json({ ok: false, error: "Read failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`leads:${ip}`, 5)) return bad("Too many submissions. Please try again later.", 429);
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return bad("Submission is too large.", 413);

  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return bad("Invalid submission.");
    const body = parsed as Record<string, unknown>;
    if (asString(body.website)) return NextResponse.json({ ok: true }); // honeypot: bots succeed silently

    const rawName = asString(body.name);
    const name = cleanOneLine(rawName, 100);
    const phone = cleanOneLine(body.phone, 20);
    const areaSlug = cleanOneLine(body.area_slug, 80);
    const budgetRange = cleanOneLine(body.budget_range, 40);
    if (rawName.length > 100 || name.length < 2) return bad("Name is required and must be under 100 characters.");
    if (!validGhPhone(phone)) return bad("Valid Ghana phone required.");
    if (!getAreas().some((area) => area.slug === areaSlug)) return bad("Choose a covered area.");
    if (!BUDGETS.some((budget) => budget === budgetRange)) return bad("Choose a valid budget range.");

    if (!(await turnstileOk(asString(body.turnstile_token) || undefined, ip))) return bad("Spam check failed.");
    const sourcePage = safeSourcePage(body.source_page);
    const { stored } = await insertRow("leads", {
      name,
      phone,
      area_slug: areaSlug,
      budget_range: budgetRange,
      source_page: sourcePage,
      status: "new",
    });
    try {
      await notifyOwner(`🏠 New TrueCost lead: ${name} → ${areaSlug}`, `Name: ${name}\nPhone: ${phone}\nArea: ${areaSlug}\nBudget: ${budgetRange}\nFrom: ${sourcePage}\nStored: ${stored}`);
    } catch {
      // Keep the stored submission successful even if optional email notification is down.
    }
    return NextResponse.json({ ok: true, stored });
  } catch {
    return NextResponse.json({ ok: false, error: "Submission failed, please retry." }, { status: 500 });
  }
}
