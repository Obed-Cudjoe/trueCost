"use client"; // R8 — newsletter capture → POST /api/newsletter.
import { useState } from "react";
import TurnstileField from "./TurnstileField";

export default function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || email.trim().length > 254) { setState("error"); return; }
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) { setState("error"); return; }
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source_page: window.location.pathname, turnstile_token: turnstileToken, website: honeypot }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="mt-12 rounded-2xl bg-ink p-8 text-center text-white">
      <h2 className="font-display text-2xl">Get benchmark updates when available.</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
        Occasional benchmark updates, new areas, and tenant-rights information. Frequency is not guaranteed; we only add you when you submit this form.
      </p>
      {state === "done" ? (
        <p className="mt-4 font-semibold text-green-400" role="status">✓ Subscription request received.</p>
      ) : (
        <form onSubmit={submit} className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="nl-website">Leave this blank</label>
            <input id="nl-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <input
            id="nl-email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-ink-soft px-4 py-2.5 text-white placeholder:text-slate-400"
          />
          <TurnstileField onToken={setTurnstileToken} />
          <button type="submit" disabled={state === "busy"} className="btn-primary rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink disabled:opacity-60">
            {state === "busy" ? "…" : "Subscribe"}
          </button>
        </form>
      )}
      {state === "error" && <p className="mt-2 text-sm text-red-400" role="alert">Please enter a valid email and complete the spam check if shown.</p>}
      <p className="mt-3 text-xs text-slate-400">To change or remove your subscription, contact us with the subscribed email address.</p>
    </section>
  );
}
