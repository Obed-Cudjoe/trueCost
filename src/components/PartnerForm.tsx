"use client"; // Agent/landlord listing submission → POST /api/partners.
import { useState } from "react";
import { PARTNER_PROPERTY_TYPES, PARTNER_ROLES, SITE } from "@/lib/site";
import TurnstileField from "./TurnstileField";

interface Props { areas: { slug: string; name: string }[]; defaultArea?: string }

export default function PartnerForm({ areas, defaultArea = "" }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", role: "agent", area: defaultArea, type: "", price: "", description: "" });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2 || form.name.trim().length > 100) e.name = "Enter your name (2–100 characters).";
    if (!/^(0\d{9}|\+233\d{9})$/.test(form.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid Ghana number.";
    if (!areas.some((area) => area.slug === form.area)) e.area = "Choose an area.";
    if (!PARTNER_PROPERTY_TYPES.some((type) => type === form.type)) e.type = "Choose a property type.";
    if (form.price && !/^\d[\d,\s]{0,28}$/.test(form.price)) e.price = "Use numbers only for price.";
    if (form.description.length > 1000) e.description = "Keep the description under 1,000 characters.";
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) e.form = "Complete the spam check before sending.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setState("busy");
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          role: form.role,
          area_slug: form.area,
          property_type: form.type,
          price: form.price,
          description: form.description,
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
        <p className="text-2xl">🤝</p>
        <h3 className="mt-2 text-lg font-bold text-ink">Submission received.</h3>
        <p className="mt-1 text-sm text-slate-600">We&apos;ll review the details before anything is published. A listing or renter match is not guaranteed.</p>
      </div>
    );
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-ink placeholder:text-slate-400 focus:border-gold-deep focus:outline-none";
  return (
    <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="partner-website">Leave this blank</label>
        <input id="partner-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <div>
        <label htmlFor="p-name" className="mb-1 block text-sm font-medium">Your name</label>
        <input id="p-name" maxLength={100} required className={input} placeholder="Kwame Owusu" value={form.name} onChange={set("name")} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="p-phone" className="mb-1 block text-sm font-medium">Phone / WhatsApp</label>
        <input id="p-phone" maxLength={20} required className={input} placeholder="0244123456" inputMode="tel" value={form.phone} onChange={set("phone")} />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>
      <div>
        <label htmlFor="p-role" className="mb-1 block text-sm font-medium">I am a…</label>
        <select id="p-role" className={input} value={form.role} onChange={set("role")}>
          {PARTNER_ROLES.map((role) => <option key={role} value={role}>{role === "landlord" ? "Landlord / caretaker" : role[0].toUpperCase() + role.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="p-area" className="mb-1 block text-sm font-medium">Property area</label>
        <select id="p-area" required className={input} value={form.area} onChange={set("area")}>
          <option value="">Select area…</option>
          {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
        {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
      </div>
      <div>
        <label htmlFor="p-type" className="mb-1 block text-sm font-medium">Property type</label>
        <select id="p-type" required className={input} value={form.type} onChange={set("type")}>
          <option value="">Select type…</option>
          {PARTNER_PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
      </div>
      <div>
        <label htmlFor="p-price" className="mb-1 block text-sm font-medium">Monthly price (GH₵)</label>
        <input id="p-price" maxLength={30} className={input} placeholder="e.g. 1500" inputMode="numeric" value={form.price} onChange={set("price")} />
        {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-desc" className="mb-1 block text-sm font-medium">Short description <span className="font-normal text-slate-500">(rooms, water, parking…)</span></label>
        <textarea id="p-desc" rows={3} maxLength={1000} className={input} placeholder="2-bed estate flat, polytank, parking for 2…" value={form.description} onChange={set("description")} />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>
      <div className="sm:col-span-2">
        <TurnstileField onToken={setTurnstileToken} />
        {errors.form && <p className="mt-1 text-sm text-red-600" role="alert">{errors.form}</p>}
        <button type="submit" disabled={state === "busy"} className="btn-primary w-full rounded-lg bg-gold px-5 py-3 font-bold text-ink disabled:opacity-60">
          {state === "busy" ? "Sending…" : "Submit listing"}
        </button>
        {state === "failed" && <p className="mt-2 text-sm text-red-600" role="alert">Couldn&apos;t send — your answers are saved above. Try again or WhatsApp us at {SITE.phoneDisplay}.</p>}
      </div>
    </form>
  );
}
