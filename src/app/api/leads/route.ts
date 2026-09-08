// POST /api/leads — lead capture. Validates → stores (Supabase or dev fallback) → notifies owner.
import { NextRequest, NextResponse } from "next/server";
import { validGhPhone, turnstileOk } from "@/lib/validate";
import { insertRow } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, area_slug, budget_range, source_page, turnstile_token, website } = body as Record<string, string>;
    if (website) return NextResponse.json({ ok: true }); // honeypot: bots "succeed" silently
    if (!name || name.trim().length < 2) return NextResponse.json({ ok: false, error: "Name required." }, { status: 400 });
    if (!validGhPhone(phone || "")) return NextResponse.json({ ok: false, error: "Valid Ghana phone required." }, { status: 400 });
    if (!area_slug || !budget_range) return NextResponse.json({ ok: false, error: "Area and budget required." }, { status: 400 });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (!(await turnstileOk(turnstile_token, ip))) return NextResponse.json({ ok: false, error: "Spam check failed." }, { status: 400 });

    const { stored } = await insertRow("leads", { name: name.trim(), phone: phone.trim(), area_slug, budget_range, source_page: source_page || "/", status: "new" });
    await notifyOwner(`🏠 New TrueCost lead: ${name} → ${area_slug}`, `Name: ${name}\nPhone: ${phone}\nArea: ${area_slug}\nBudget: ${budget_range}\nFrom: ${source_page}\nStored: ${stored}`);
    return NextResponse.json({ ok: true, stored });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Submission failed, please retry." }, { status: 500 });
  }
}
