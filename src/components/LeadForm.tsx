"use client"; // R10 — lead capture with client + server validation and spam fields.
import { useState } from "react";
import { BUDGETS, SITE } from "@/lib/site";
import TurnstileField from "./TurnstileField";

interface Props { areas: { slug: string; name: string }[]; compact?: boolean; defaultArea?: string }

export default function LeadForm({ areas, compact = false, defaultArea = "" }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", area: defaultArea, budget: "" });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "busy" | "done" | "failed">("idle");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2 || form.name.trim().length > 100) e.name = "Enter your name (2–100 characters).";
    if (!/^(0\d{9}|\+233\d{9})$/.test(form.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid Ghana number, e.g. 0244123456.";
    if (!form.area || !areas.some((area) => area.slug === form.area)) e.area = "Choose an area.";
    if (!BUDGETS.some((budget) => budget === form.budget)) e.budget = "Choose a budget range.";
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) e.form = "Complete the spam check before sending.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setState("busy");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          area_slug: form.area,
          budget_range: form.budget,
          source_page: window.location.pathname,
          turnstile_token: turnstileToken,
          website: honeypot,
        }),
      });
      setState(res.ok ? "done" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center" role="status">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 text-lg font-bold text-ink">Request received.</h3>
        <p className="mt-1 text-sm text-slate-600">Your details are saved for owner review. If you need a quicker conversation, use WhatsApp.</p>
      </div>
    );
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-ink placeholder:text-slate-400 focus:border-gold-deep focus:outline-none";
  return (
    <form onSubmit={submit} noValidate className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="lead-website">Leave this blank</label>
        <input id="lead-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <div>
        <label htmlFor="lead-name" className="mb-1 block text-sm font-medium">Your name</label>
        <input id="lead-name" maxLength={100} required className={input} placeholder="Ama Mensah" value={form.name} onChange={set("name")} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium">Phone / WhatsApp</label>
        <input id="lead-phone" maxLength={20} required className={input} placeholder="0244123456" inputMode="tel" value={form.phone} onChange={set("phone")} />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>
      <div>
        <label htmlFor="lead-area" className="mb-1 block text-sm font-medium">Area</label>
        <select id="lead-area" required className={input} value={form.area} onChange={set("area")}>
          <option value="">Select area…</option>
          {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
        {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
      </div>
      <div>
        <label htmlFor="lead-budget" className="mb-1 block text-sm font-medium">Monthly budget</label>
        <select id="lead-budget" required className={input} value={form.budget} onChange={set("budget")}>
          <option value="">Select range…</option>
          {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
      </div>
      <div className={compact ? "" : "sm:col-span-2"}>
        <TurnstileField onToken={setTurnstileToken} />
        {errors.form && <p className="mt-1 text-sm text-red-600" role="alert">{errors.form}</p>}
        <button type="submit" disabled={state === "busy"} className="btn-primary w-full rounded-lg bg-gold px-5 py-3 font-bold text-ink disabled:opacity-60">
          {state === "busy" ? "Sending…" : "Send my request"}
        </button>
        {state === "failed" && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            Couldn&apos;t send — your answers are saved above. Try again, or{" "}
            <a className="font-semibold underline" target="_blank" rel="noreferrer" href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi TrueCost — I'm ${form.name || "house-hunting"} and need help in ${form.area || "Accra"}.`)}`}>
              continue on WhatsApp →
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
