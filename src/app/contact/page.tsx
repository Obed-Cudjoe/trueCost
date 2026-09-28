// P11 — Contact: form + WhatsApp panel.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send TrueCost a correction, question, or partnership message.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="font-display text-4xl text-ink">Talk to a human.</h1>
      <p className="mt-2 text-slate-600">Send a correction, question, or partnership note. Response times vary.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <ContactForm />
        </div>
        <aside className="h-fit rounded-2xl bg-ink p-6 text-white">
          <h2 className="font-bold text-gold">Reach us directly</h2>
          <p className="mt-1 text-sm text-slate-300">Use WhatsApp for a direct message; response times vary.</p>
          <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi TrueCost — ")}`} target="_blank" rel="noreferrer"
            className="mt-4 block rounded-lg bg-[#25D366] px-4 py-3 text-center font-bold text-ink">✆ WhatsApp {SITE.phoneDisplay}</a>
          <a href={`tel:+${SITE.whatsapp}`}
            className="btn-ghost mt-2 block rounded-lg border border-slate-500 px-4 py-3 text-center font-bold text-white">☎ Call {SITE.phoneDisplay}</a>
          {SITE.email && (
            <a href={`mailto:${SITE.email}`} className="mt-3 flex items-center gap-2 break-all text-sm text-slate-200 hover:text-gold">
              <span aria-hidden>✉️</span> {SITE.email}
            </a>
          )}
          {SITE.linkedin && (
            <a href={SITE.linkedin} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 text-sm text-slate-200 hover:text-gold">
              <span aria-hidden>💼</span> Connect on LinkedIn →
            </a>
          )}
          <p className="mt-4 border-t border-ink-line pt-4 text-sm text-slate-300">Spotted a stale price? Choose topic <b>Correction</b> and include the source you have.</p>
          <p className="mt-2 text-sm"><Link href="/rights" className="font-semibold text-gold hover:underline">Tenant rights →</Link></p>
        </aside>
      </div>
    </>
  );
}
