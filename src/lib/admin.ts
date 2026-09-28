import crypto from "crypto";
import type { NextRequest } from "next/server";

/** Server-side owner authentication for private tracker data. */
export function adminKeyIsValid(req: NextRequest): boolean {
  const expected = process.env.TRACKER_ACCESS_SECRET;
  const authorization = req.headers.get("authorization") || "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!expected || !supplied || supplied.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
