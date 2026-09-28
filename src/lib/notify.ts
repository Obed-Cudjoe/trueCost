// Owner notification emails via Resend. Silent no-op when not configured.
import { Resend } from "resend";

export async function notifyOwner(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !to || !from) return { sent: false, reason: "email not configured" };
  const resend = new Resend(key);
  await resend.emails.send({ from, to, subject, text });
  return { sent: true };
}
