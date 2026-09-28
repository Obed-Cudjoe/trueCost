// POST /api/reports — renter price observations (public, stored privately).
// GET  — owner-only list for review. PATCH — owner-only approve / reject / clarify.
import { NextRequest, NextResponse } from "next/server";
import { getAreas } from "@/lib/content";
import { getPublishedRoomTypes } from "@/lib/discovery";
import { adminKeyIsValid } from "@/lib/admin";
import { asString, cleanOneLine, cleanText, getClientIp, rateLimit, safeSourcePage, turnstileOk } from "@/lib/validate";
import { REPORT_STATUSES, validateReport, type ReportStatus } from "@/lib/reports";
import { insertRow, readRows, updateRow } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 20_000;
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(req: NextRequest) {
  if (!adminKeyIsValid(req)) return NextResponse.json({ ok: false }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    return NextResponse.json({ ok: true, rows: await readRows("price_reports") }, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json({ ok: false, error: "Read failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`reports:${ip}`, 3)) return bad("Too many reports from this connection. Please try again later.", 429);
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return bad("Submission is too large.", 413);

  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return bad("Invalid submission.");
    const body = parsed as Record<string, unknown>;
    if (asString(body.website)) return NextResponse.json({ ok: true }); // honeypot: bots succeed silently

    const today = new Date().toISOString().slice(0, 10);
    const result = validateReport(
      body,
      { areas: getAreas().map((area) => area.slug), roomTypes: getPublishedRoomTypes() },
      today,
    );
    if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 400, headers: PRIVATE_HEADERS });

    if (!(await turnstileOk(asString(body.turnstile_token) || undefined, ip))) return bad("Spam check failed.");

    const { stored } = await insertRow("price_reports", {
      area_slug: result.value.areaSlug,
      room_type: result.value.roomType,
      observed_rent: result.value.observedRent,
      observed_on: result.value.observedOn,
      basis: result.value.basis,
      source_context: result.value.sourceContext,
      contact: result.value.contact,
      source_page: safeSourcePage(body.source_page),
      status: "pending",
    });

    try {
      await notifyOwner(
        `📣 New price report: ${result.value.roomType} in ${result.value.areaSlug}`,
        `Area: ${result.value.areaSlug}\nRoom type: ${result.value.roomType}\nObserved rent: GH₵${result.value.observedRent}\nObserved on: ${result.value.observedOn}\nBasis: ${result.value.basis}\nContext: ${result.value.sourceContext || "none"}\nContact (private): ${result.value.contact || "none"}\nStored: ${stored}\n\nPending review — nothing is published until you approve it.`,
      );
    } catch {
      // Keep the stored submission even if optional email notification is down.
    }

    return NextResponse.json({ ok: true, stored, status: "pending" }, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json({ ok: false, error: "Submission failed, please retry." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!adminKeyIsValid(req)) return NextResponse.json({ ok: false }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return bad("Invalid request.");
    const body = parsed as Record<string, unknown>;
    const id = cleanOneLine(body.id, 60);
    const status = cleanOneLine(body.status, 30) as ReportStatus;
    const note = cleanText(body.note, 500);
    if (!id) return bad("A report id is required.");
    if (!REPORT_STATUSES.includes(status)) return bad("Choose a valid review outcome.");

    const updated = await updateRow("price_reports", id, {
      status,
      review_note: note,
      reviewed_at: new Date().toISOString(),
    });
    if (!updated) return bad("That report could not be found.", 404);
    return NextResponse.json({ ok: true, id, status }, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
}
