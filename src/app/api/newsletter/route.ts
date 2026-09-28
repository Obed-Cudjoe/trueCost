// POST /api/newsletter — subscribe. Duplicates return success (idempotent).
import { NextRequest, NextResponse } from "next/server";
import { asString, getClientIp, rateLimit, safeSourcePage, turnstileOk, validEmail } from "@/lib/validate";
import { supabase, insertRow } from "@/lib/db";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8_000;

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`newsletter:${ip}`, 3)) return bad("Too many subscription attempts. Please try again later.", 429);
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return bad("Submission is too large.", 413);

  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return bad("Invalid submission.");
    const body = parsed as Record<string, unknown>;
    if (asString(body.website)) return NextResponse.json({ ok: true });
    const email = asString(body.email).trim().toLowerCase();
    if (!validEmail(email)) return bad("Valid email required.");
    if (!(await turnstileOk(asString(body.turnstile_token) || undefined, ip))) return bad("Spam check failed.");

    const sourcePage = safeSourcePage(body.source_page);
    const sb = supabase();
    if (sb) {
      const { data } = await sb.from("newsletter_subscribers").select("id").eq("email", email).limit(1);
      if (!data || data.length === 0) await insertRow("newsletter_subscribers", { email, source_page: sourcePage, unsubscribed: false });
    } else {
      await insertRow("newsletter_subscribers", { email, source_page: sourcePage, unsubscribed: false });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Subscription failed, please retry." }, { status: 500 });
  }
}
