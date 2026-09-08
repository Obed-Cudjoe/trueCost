"use client"; // R6 — accessible FAQ accordion (native <details>, zero JS state bugs).
import type { Faq } from "@/lib/content";

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-2">
      {faqs.map((f) => (
        <details key={f.q} className="group rounded-xl border border-slate-200 bg-white px-4 py-3">
          <summary className="cursor-pointer font-medium text-ink marker:text-gold-deep">
            {f.q}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
