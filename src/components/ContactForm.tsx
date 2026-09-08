"use client"; // P11 form — name, email/phone, topic, message → POST /api/contact.
import { useState } from "react";
import { SITE } from "@/lib/site";

const TOPICS = ["question", "correction", "partnership", "other"];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", contact: "", topic: "question", message: "" });
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.contact) && !/^(0\d{9}|\+233\d{9})$/.test(form.contact.replace(/[\s-]/g, "")))
      return setError("Enter a valid email or Ghana phone number.");
    if (form.message.trim().length < 10) return setError("Please write a little more (10+ characters).");
    setState("busy");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) setState("done");
      else setError("Couldn't send — your message is saved above. Try again or use WhatsApp.");
    } catch {
      setError("Couldn't send — your message is saved above. Try again or use WhatsApp.");
    } finally {
      if (state !== "done") setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center" role="status">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 font-bold text-ink">Thanks — your message is in.</h3>
        <p className="text-sm text-slate-600">Expect a reply {SITE.responsePromise}.</p>
      </div>
    );
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-gold-deep focus:outline-none";
  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <div>
        <label htmlFor="c-name" className="mb-1 block text-sm font-medium">Your name</label>
        <input id="c-name" className={input} value={form.name} onChange={set("name")} placeholder="Ama Mensah" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="c-contact" className="mb-1 block text-sm font-medium">Email or phone</label>
          <input id="c-contact" className={input} value={form.contact} onChange={set("contact")} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="c-topic" className="mb-1 block text-sm font-medium">Topic</label>
          <select id="c-topic" className={input} value={form.topic} onChange={set("topic")}>
            {TOPICS.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="c-msg" className="mb-1 block text-sm font-medium">Message</label>
        <textarea id="c-msg" rows={5} className={input} value={form.message} onChange={set("message")} placeholder="How can we help?" />
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={state === "busy"} className="btn-primary rounded-lg bg-gold px-5 py-3 font-bold text-ink disabled:opacity-60">
        {state === "busy" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
