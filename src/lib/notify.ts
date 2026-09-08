// Owner notification emails via Resend. Silent no-op when no API key is set (dev).
import { Resend } from "resend";

export async function notifyOwner(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_NOTIFY_EMAIL;
  if (!key || !to) return { sent: false, reason: "email not configured (dev mode)" };
  const resend = new Resend(key);
  await resend.emails.send({ from: "TrueCost <noreply@truecost.site>", to, subject, text });
  return { sent: true };
}
