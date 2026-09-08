// Database layer — Supabase Postgres when configured, local JSONL fallback in dev.
// Every form submission is REALLY stored: Supabase table in production,
// data/*.jsonl (git-ignored) when keys are absent so demos never fake success.
import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("xyzcompany")) return null; // not configured
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

// Local dev fallback store (NOT used in production).
function appendLocal(table: string, row: Record<string, unknown>) {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(path.join(dir, `${table}.jsonl`), JSON.stringify({ ...row, _at: new Date().toISOString() }) + "\n");
}

export async function insertRow(table: "leads" | "contact_messages" | "newsletter_subscribers", row: Record<string, unknown>) {
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from(table).insert(row);
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return { stored: "supabase" as const };
  }
  appendLocal(table, row); // dev/demo fallback — real storage, local file
  return { stored: "local-dev" as const };
}
