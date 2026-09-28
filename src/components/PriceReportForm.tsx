"use client"; // Renter price report — validated with the same rules the server uses.
import { useState } from "react";
import Link from "next/link";
import { BASIS_LABEL, MAX_CONTEXT, MAX_CONTACT, REPORT_BASES, validateReport, type ReportBasis } from "@/lib/reports";
import TurnstileField from "./TurnstileField";

interface Props {
  areas: { slug: string; name: string }[];
  roomTypes: string[];
  defaultArea?: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-ink placeholder:text-slate-400 focus:border-gold-deep focus:outline-none";

export default function PriceReportForm({ areas, roomTypes, defaultArea = "" }: Props) {
  const [form, setForm] = useState({
    areaSlug: areas.some((area) => area.slug === defaultArea) ? defaultArea : "",
    roomType: "",
    observedRent: "",
    observedOn: "",
    basis: "" as ReportBasis | "",
    sourceContext: "",
    contact: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "busy" | "done" | "failed">("idle");

  const today = new Date().toISOString().slice(0, 10);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = validateReport(
      { ...form, basis: form.basis || undefined },
      { areas: areas.map((area) => area.slug), roomTypes },
      today,
    );
    if (!result.ok) {
      setErrors(result.errors as Record<string, string>);
      return;
    }
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setErrors({ form: "Complete the spam check before sending." });
      return;
    }
    setErrors({});
    setState("busy");

    void fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        areaSlug: result.value.areaSlug,
        roomType: result.value.roomType,
        observedRent: result.value.observedRent,
        observedOn: result.value.observedOn,
        basis: result.value.basis,
        sourceContext: result.value.sourceContext,
        contact: result.value.contact,
        source_page: window.location.pathname,
        turnstile_token: turnstileToken,
        website: honeypot,
      }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Record<string, string> };
        if (!res.ok || !data.ok) {
          if (data.errors) setErrors(data.errors);
          setState("failed");
          return;
        }
        setState("done");
      })
      .catch(() => setState("failed"));
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6" role="status">
        <p className="text-2xl">✅</p>
        <h2 className="mt-2 text-lg font-bold text-ink">Report received — it is not published yet.</h2>
        <p className="mt-1 text-sm text-slate-700">
          Your observation is stored privately with the status <b>pending</b>. The owner reviews it before anything appears on a page, and
          approved reports are always labelled as renter-reported, never as a verified benchmark.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/areas" className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold">
            Back to area guides
          </Link>
          <Link href="/compare" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
            Compare areas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="report-website">Leave this blank</label>
        <input id="report-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="report-area" className="mb-1 block text-sm font-medium">
            Area <span className="text-red-600">*</span>
          </label>
          <select
            id="report-area"
            required
            className={inputClass}
            value={form.areaSlug}
            onChange={(e) => setForm({ ...form, areaSlug: e.target.value })}
          >
            <option value="">Select area…</option>
            {areas.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
          {errors.areaSlug && <p className="mt-1 text-xs text-red-600">{errors.areaSlug}</p>}
        </div>

        <div>
          <label htmlFor="report-type" className="mb-1 block text-sm font-medium">
            Room type <span className="text-red-600">*</span>
          </label>
          <select
            id="report-type"
            required
            className={inputClass}
            value={form.roomType}
            onChange={(e) => setForm({ ...form, roomType: e.target.value })}
          >
            <option value="">Select room type…</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.roomType && <p className="mt-1 text-xs text-red-600">{errors.roomType}</p>}
        </div>

        <div>
          <label htmlFor="report-rent" className="mb-1 block text-sm font-medium">
            Monthly rent you saw (GH₵) <span className="text-red-600">*</span>
          </label>
          <input
            id="report-rent"
            inputMode="decimal"
            required
            className={inputClass}
            placeholder="1500"
            value={form.observedRent}
            onChange={(e) => setForm({ ...form, observedRent: e.target.value })}
          />
          {errors.observedRent && <p className="mt-1 text-xs text-red-600">{errors.observedRent}</p>}
        </div>

        <div>
          <label htmlFor="report-date" className="mb-1 block text-sm font-medium">
            Date you saw it <span className="text-red-600">*</span>
          </label>
          <input
            id="report-date"
            type="date"
            required
            max={today}
            className={inputClass}
            value={form.observedOn}
            onChange={(e) => setForm({ ...form, observedOn: e.target.value })}
          />
          {errors.observedOn && <p className="mt-1 text-xs text-red-600">{errors.observedOn}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">
          Was this an asking price or a rent actually paid? <span className="text-red-600">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {REPORT_BASES.map((basis) => (
            <label key={basis} className="flex items-start gap-2 rounded-lg border border-slate-300 bg-white p-3 text-sm">
              <input
                type="radio"
                name="report-basis"
                value={basis}
                checked={form.basis === basis}
                onChange={() => setForm({ ...form, basis })}
                className="mt-0.5"
              />
              <span>{BASIS_LABEL[basis]}</span>
            </label>
          ))}
        </div>
        {errors.basis && <p className="mt-1 text-xs text-red-600">{errors.basis}</p>}
      </fieldset>

      <div>
        <label htmlFor="report-context" className="mb-1 block text-sm font-medium">
          How did you see this? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="report-context"
          maxLength={MAX_CONTEXT}
          rows={3}
          className={inputClass}
          placeholder="e.g. quoted by an agent during a viewing, or written in my tenancy agreement"
          value={form.sourceContext}
          onChange={(e) => setForm({ ...form, sourceContext: e.target.value })}
        />
        <p className="mt-1 text-xs text-slate-500">Stored privately and never published. {form.sourceContext.length}/{MAX_CONTEXT}</p>
      </div>

      <div>
        <label htmlFor="report-contact" className="mb-1 block text-sm font-medium">
          Contact details <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="report-contact"
          maxLength={MAX_CONTACT}
          className={inputClass}
          placeholder="Phone or email — only if you are happy to be contacted"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />
        <p className="mt-1 text-xs text-slate-500">
          Only needed if you are happy for the owner to ask one follow-up question about this report. It stays private, is never published,
          and the report is still reviewed if you leave it blank.
        </p>
      </div>

      <div>
        <TurnstileField onToken={setTurnstileToken} />
        {errors.form && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.form}
          </p>
        )}
        <button type="submit" disabled={state === "busy"} className="btn-primary w-full rounded-lg bg-gold px-5 py-3 font-bold text-ink disabled:opacity-60">
          {state === "busy" ? "Sending…" : "Send this observation for review"}
        </button>
        {state === "failed" && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            Couldn&apos;t send — your answers are still on screen. Please fix any messages above and try again.
          </p>
        )}
      </div>
    </form>
  );
}
