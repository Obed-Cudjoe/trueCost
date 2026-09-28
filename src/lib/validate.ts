// Shared validation for API routes + client forms. Keep both in sync.

// Ghana phone: 10 digits starting with 0 (e.g. 0244123456) or +233XXXXXXXXX.
export function validGhPhone(raw: string): boolean {
  const v = raw.replace(/[\s-]/g, "");
  return /^(0\d{9}|\+233\d{9})$/.test(v);
}

export function validEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim()) && raw.trim().length <= 254;
}

export function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function cleanText(value: unknown, maxLength: number): string {
  return asString(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

export function cleanOneLine(value: unknown, maxLength: number): string {
  return cleanText(value, maxLength).replace(/[\r\n]+/g, " ");
}

export function safeSourcePage(value: unknown): string {
  const page = cleanOneLine(value, 200);
  return /^\/(?!\/)[A-Za-z0-9/_?=&.%~+#-]*$/.test(page) ? page : "/";
}

export function getClientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 80) || headers.get("x-real-ip")?.slice(0, 80) || "unknown";
}

// Small best-effort rate limiter for serverless instances. Turnstile remains the
// primary shield when configured; this also limits repeated requests without it.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
export function rateLimit(key: string, limit: number, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  if (buckets.size > 2000) {
    for (const [k, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(k);
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

// Cloudflare Turnstile check. Skipped only when no secret is configured (local dev).
export async function turnstileOk(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
