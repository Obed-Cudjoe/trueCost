// POST /api/partners — agent/landlord listing submissions. GET is owner-only.
import { NextRequest, NextResponse } from "next/server";
import { PARTNER_PROPERTY_TYPES, PARTNER_ROLES } from "@/lib/site";
import { getAreas } from "@/lib/content";
import { adminKeyIsValid } from "@/lib/admin";
import { asString, cleanOneLine, cleanText, getClientIp, rateLimit, safeSourcePage, turnstileOk, validGhPhone } from "@/lib/validate";
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
    return NextResponse.json({ ok: true, rows: await readRows("partners") }, { headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json({ ok: false, error: "Read failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`partners:${ip}`, 5)) return bad("Too many submissions. Please try again later.", 429);
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return bad("Submission is too large.", 413);

  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return bad("Invalid submission.");
    const body = parsed as Record<string, unknown>;
    if (asString(body.website)) return NextResponse.json({ ok: true });

    const rawName = asString(body.name);
    const name = cleanOneLine(rawName, 100);
    const phone = cleanOneLine(body.phone, 20);
    const role = cleanOneLine(body.role, 20);
    const areaSlug = cleanOneLine(body.area_slug, 80);
    const propertyType = cleanOneLine(body.property_type, 50);
    const price = cleanOneLine(body.price, 30);
    const description = cleanText(body.description, 1_000);
    if (rawName.length > 100 || name.length < 2) return bad("Name is required and must be under 100 characters.");
    if (!validGhPhone(phone)) return bad("Valid Ghana phone required.");
    if (!PARTNER_ROLES.some((candidate) => candidate === role)) return bad("Choose a valid role.");
    if (!getAreas().some((area) => area.slug === areaSlug)) return bad("Choose a covered area.");
    if (!PARTNER_PROPERTY_TYPES.some((candidate) => candidate === propertyType)) return bad("Choose a valid property type.");
    if (price && !/^\d[\d,\s]{0,28}$/.test(price)) return bad("Price should contain numbers only.");
    if (!(await turnstileOk(asString(body.turnstile_token) || undefined, ip))) return bad("Spam check failed.");

    const sourcePage = safeSourcePage(body.source_page);
    const { stored } = await insertRow("partners", {
      name,
      phone,
      role,
      area_slug: areaSlug,
      property_type: propertyType,
      price,
      description,
      source_page: sourcePage,
      status: "new",
    });
    try {
      await notifyOwner(`🤝 New partner listing: ${name} → ${areaSlug}`, `Name: ${name}\nPhone: ${phone}\nRole: ${role}\nArea: ${areaSlug}\nType: ${propertyType}\nPrice: ${price}\nStored: ${stored}`);
    } catch {
      // Keep the private submission stored if optional email notification is down.
    }
    return NextResponse.json({ ok: true, stored });
  } catch {
    return NextResponse.json({ ok: false, error: "Submission failed, please retry." }, { status: 500 });
  }
}
