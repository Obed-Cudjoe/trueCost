// Shared validation for API routes + client forms. Keep both in sync.

// Ghana phone: 10 digits starting with 0 (e.g. 0244123456) or +233XXXXXXXXX.
export function validGhPhone(raw: string): boolean {
  const v = raw.replace(/[\s-]/g, "");
  return /^(0\d{9}|\+233\d{9})$/.test(v);
}

export function validEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

// Cloudflare Turnstile check. Skipped when no secret is configured (local dev).
export async function turnstileOk(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // dev mode — no spam shield configured
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
