// Database layer — Supabase Postgres when configured, local JSONL fallback in dev.
// Every form submission is REALLY stored: Supabase table in production,
// data/*.jsonl (git-ignored) when keys are absent so demos never fake success.
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
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

export type StoredTable = "leads" | "contact_messages" | "newsletter_subscribers" | "partners" | "price_reports";
export type ReadableTable = "leads" | "partners" | "price_reports";

export async function insertRow(table: StoredTable, row: Record<string, unknown>) {
  // Give every submission a stable id in both storage modes, so the owner can
  // review (approve / reject / clarify) a row even without Supabase configured.
  const payload = { id: randomUUID(), ...row };
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from(table).insert(payload);
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return { stored: "supabase" as const };
  }
  appendLocal(table, payload); // dev/demo fallback — real storage, local file
  return { stored: "local-dev" as const };
}

// Read side for the private tracker (/track). Newest first.
export async function readRows(table: ReadableTable, limit = 200): Promise<Record<string, unknown>[]> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb.from(table).select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    return (data ?? []) as Record<string, unknown>[];
  }
  const file = path.join(process.cwd(), "data", `${table}.jsonl`);
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .reverse()
    .slice(0, limit);
}

/**
 * Owner-only status changes (used by the price-report review flow).
 * Returns false when the row could not be found in the local fallback file.
 */
export async function updateRow(table: StoredTable, id: string, patch: Record<string, unknown>): Promise<boolean> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb.from(table).update(patch).eq("id", id).select("id");
    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return (data ?? []).length > 0;
  }
  const file = path.join(process.cwd(), "data", `${table}.jsonl`);
  if (!fs.existsSync(file)) return false;
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  let found = false;
  const next = lines.map((line) => {
    try {
      const row = JSON.parse(line) as Record<string, unknown>;
      if (String(row.id) !== id) return line;
      found = true;
      return JSON.stringify({ ...row, ...patch });
    } catch {
      return line;
    }
  });
  if (!found) return false;
  fs.writeFileSync(file, next.join("\n") + "\n");
  return true;
}
