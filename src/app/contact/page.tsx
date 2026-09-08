// P11 — Contact: form + WhatsApp panel.
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Talk to a human at TrueCost — corrections, questions, partnerships. Replies within 24 hours." };

export default function Contact() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="font-display text-4xl text-ink">Talk to a human.</h1>
      <p className="mt-2 text-slate-600">We reply {SITE.responsePromise} — including price corrections.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <ContactForm />
        </div>
        <aside className="h-fit rounded-2xl bg-ink p-6 text-white">
          <h2 className="font-bold text-gold">Prefer WhatsApp?</h2>
          <p className="mt-1 text-sm text-slate-300">Fastest for corrections and urgent questions.</p>
          <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi TrueCost — ")}`} target="_blank" rel="noreferrer"
            className="mt-4 block rounded-lg bg-[#25D366] px-4 py-3 text-center font-bold text-ink">✆ Chat now</a>
          <p className="mt-4 text-sm text-slate-300">Spotted a stale price? Choose topic <b>Correction</b> and we'll re-check it.</p>
          <p className="mt-2 text-sm"><Link href="/rights" className="font-semibold text-gold hover:underline">Tenant rights →</Link></p>
        </aside>
      </div>
    </>
  );
}
