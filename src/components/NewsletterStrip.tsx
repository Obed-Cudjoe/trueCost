"use client"; // R8 — backup conversion: newsletter capture → POST /api/newsletter.
import { useState } from "react";

export default function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setState("error"); return; }
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source_page: window.location.pathname }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="mt-12 rounded-2xl bg-ink p-8 text-center text-white">
      <h2 className="font-display text-2xl">Track prices monthly. Never negotiate blind.</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
        One short email per month: benchmark updates, new areas, and tenant-rights wins. No spam, unsubscribe anytime.
      </p>
      {state === "done" ? (
        <p className="mt-4 font-semibold text-green-400">✓ You're in — first update lands soon.</p>
      ) : (
        <form onSubmit={submit} className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <input
            id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-slate-600 bg-ink-soft px-4 py-2.5 text-white placeholder:text-slate-400"
          />
          <button type="submit" disabled={state === "busy"} className="btn-primary rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink disabled:opacity-60">
            {state === "busy" ? "…" : "Subscribe"}
          </button>
        </form>
      )}
      {state === "error" && <p className="mt-2 text-sm text-red-400">Please enter a valid email and try again.</p>}
    </section>
  );
}
