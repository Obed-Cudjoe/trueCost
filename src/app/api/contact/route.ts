// POST /api/contact — contact + price-correction tips.
import { NextRequest, NextResponse } from "next/server";
import { validEmail, validGhPhone, turnstileOk } from "@/lib/validate";
import { insertRow } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contact, topic, message, turnstile_token, website } = body as Record<string, string>;
    if (website) return NextResponse.json({ ok: true });
    if (!name || name.trim().length < 2) return NextResponse.json({ ok: false, error: "Name required." }, { status: 400 });
    if (!validEmail(contact || "") && !validGhPhone(contact || "")) return NextResponse.json({ ok: false, error: "Valid email or Ghana phone required." }, { status: 400 });
    if (!message || message.trim().length < 10) return NextResponse.json({ ok: false, error: "Message too short." }, { status: 400 });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (!(await turnstileOk(turnstile_token, ip))) return NextResponse.json({ ok: false, error: "Spam check failed." }, { status: 400 });

    const { stored } = await insertRow("contact_messages", { name: name.trim(), contact: contact.trim(), topic: topic || "question", message: message.trim(), status: "new" });
    await notifyOwner(`✉️ TrueCost contact [${topic}]: ${name}`, `From: ${name} (${contact})\nTopic: ${topic}\n\n${message}\n\nStored: ${stored}`);
    return NextResponse.json({ ok: true, stored });
  } catch {
    return NextResponse.json({ ok: false, error: "Submission failed, please retry." }, { status: 500 });
  }
}
