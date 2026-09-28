// POST /api/contact — contact + price-correction messages.
import { NextRequest, NextResponse } from "next/server";
import { CONTACT_TOPICS } from "@/lib/site";
import { asString, cleanOneLine, cleanText, getClientIp, rateLimit, turnstileOk, validEmail, validGhPhone } from "@/lib/validate";
import { insertRow } from "@/lib/db";
import { notifyOwner as sendOwnerEmail } from "@/lib/notify";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 20_000;

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

// Keep this endpoint intentionally write-only; contact submissions are not public.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`contact:${ip}`, 5)) return bad("Too many submissions. Please try again later.", 429);
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return bad("Submission is too large.", 413);

  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return bad("Invalid submission.");
    const body = parsed as Record<string, unknown>;
    if (asString(body.website)) return NextResponse.json({ ok: true });

    const rawName = asString(body.name);
    const name = cleanOneLine(rawName, 100);
    const contact = cleanOneLine(body.contact, 254);
    const topic = cleanOneLine(body.topic, 30);
    const message = cleanText(body.message, 5_000);
    if (rawName.length > 100 || name.length < 2) return bad("Name is required and must be under 100 characters.");
    if (!validEmail(contact) && !validGhPhone(contact)) return bad("Valid email or Ghana phone required.");
    if (message.length < 10) return bad("Message must be at least 10 characters.");
    if (!CONTACT_TOPICS.some((candidate) => candidate === topic)) return bad("Choose a valid topic.");
    if (!(await turnstileOk(asString(body.turnstile_token) || undefined, ip))) return bad("Spam check failed.");

    const { stored } = await insertRow("contact_messages", { name, contact, topic, message, status: "new" });
    try {
      await sendOwnerEmail(`✉️ TrueCost contact [${topic}]: ${name}`, `From: ${name} (${contact})\nTopic: ${topic}\n\n${message}\n\nStored: ${stored}`);
    } catch {
      // The private stored message remains available even if optional email notification is down.
    }
    return NextResponse.json({ ok: true, stored });
  } catch {
    return NextResponse.json({ ok: false, error: "Submission failed, please retry." }, { status: 500 });
  }
}
