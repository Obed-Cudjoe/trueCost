"use client"; // R1 — sticky header with desktop nav + mobile hamburger menu.
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/areas", label: "Areas" },
  { href: "/guides/single-room-self-contain", label: "Guides" },
  { href: "/calculator", label: "Calculator" },
  { href: "/rights", label: "Rights" },
  { href: "/news", label: "News" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-ink text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="TrueCost home">
          <Image src="/images/logo-horizontal.png" alt="TrueCost" width={168} height={40} priority />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-slate-200 transition hover:text-gold">
              {l.label}
            </Link>
          ))}
          <Link href="/search" className="text-slate-200 transition hover:text-gold" aria-label="Search">⌕ Search</Link>
          <Link href="/get-help" className="btn-primary rounded-lg bg-gold px-4 py-2 font-semibold text-ink">
            Get Matched
          </Link>
        </nav>
        {/* Hamburger (mobile/tablet) */}
        <button
          className="rounded-lg border border-slate-600 p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-700 px-4 pb-4 md:hidden" aria-label="Mobile">
          {[...LINKS, { href: "/search", label: "⌕ Search" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-800 py-3 text-slate-100"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/get-help"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-lg bg-gold px-4 py-3 text-center font-semibold text-ink"
          >
            Get Matched
          </Link>
        </nav>
      )}
    </header>
  );
}
