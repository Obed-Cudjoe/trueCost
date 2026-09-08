// POST /api/newsletter — subscribe. Duplicates return success (idempotent).
import { NextRequest, NextResponse } from "next/server";
import { validEmail } from "@/lib/validate";
import { supabase, insertRow } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, source_page } = (await req.json()) as { email?: string; source_page?: string };
    if (!validEmail(email || "")) return NextResponse.json({ ok: false, error: "Valid email required." }, { status: 400 });
    const clean = email!.trim().toLowerCase();
    const sb = supabase();
    if (sb) {
      const { data } = await sb.from("newsletter_subscribers").select("id").eq("email", clean).limit(1);
      if (!data || data.length === 0) await insertRow("newsletter_subscribers", { email: clean, source_page: source_page || "/", unsubscribed: false });
    } else {
      await insertRow("newsletter_subscribers", { email: clean, source_page: source_page || "/", unsubscribed: false });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Subscription failed, please retry." }, { status: 500 });
  }
}
