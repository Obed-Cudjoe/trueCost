"use client"; // P11 form — validated contact/correction message → POST /api/contact.
import { useState } from "react";
import { CONTACT_TOPICS, SITE } from "@/lib/site";
import TurnstileField from "./TurnstileField";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", contact: "", topic: "question", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2 || form.name.trim().length > 100) return setError("Enter your name (2–100 characters).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.contact.trim()) && !/^(0\d{9}|\+233\d{9})$/.test(form.contact.replace(/[\s-]/g, "")))
      return setError("Enter a valid email or Ghana phone number.");
    if (form.message.trim().length < 10 || form.message.length > 5000) return setError("Message must be 10–5,000 characters.");
    if (!CONTACT_TOPICS.some((topic) => topic === form.topic)) return setError("Choose a valid topic.");
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) return setError("Complete the spam check before sending.");
    setState("busy");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source_page: window.location.pathname, turnstile_token: turnstileToken, website: honeypot }),
      });
      if (res.ok) setState("done");
      else { setState("idle"); setError("Couldn't send — your message is saved above. Try again or use WhatsApp."); }
    } catch {
      setState("idle");
setError("Couldn't send — your message is saved above. Try again or use WhatsApp.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center" role="status">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 font-bold text-ink">Message received.</h3>
        <p className="text-sm text-slate-600">It is stored for owner review. Response times vary; WhatsApp is available for a quicker conversation.</p>
      </div>
    );
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-gold-deep focus:outline-none";
  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this blank</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <div>
        <label htmlFor="c-name" className="mb-1 block text-sm font-medium">Your name</label>
        <input id="c-name" maxLength={100} required className={input} value={form.name} onChange={set("name")} placeholder="Ama Mensah" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="c-contact" className="mb-1 block text-sm font-medium">Email or phone</label>
          <input id="c-contact" maxLength={254} required className={input} value={form.contact} onChange={set("contact")} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="c-topic" className="mb-1 block text-sm font-medium">Topic</label>
          <select id="c-topic" className={input} value={form.topic} onChange={set("topic")}>
            {CONTACT_TOPICS.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="c-msg" className="mb-1 block text-sm font-medium">Message</label>
        <textarea id="c-msg" rows={5} maxLength={5000} required className={input} value={form.message} onChange={set("message")} placeholder="How can we help?" />
      </div>
      <TurnstileField onToken={setTurnstileToken} />
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={state === "busy"} className="btn-primary rounded-lg bg-gold px-5 py-3 font-bold text-ink disabled:opacity-60">
        {state === "busy" ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs text-slate-500">We keep this submission in the private server-side store. See the <a className="underline" href="/privacy">Privacy Policy</a>.</p>
    </form>
  );
}
