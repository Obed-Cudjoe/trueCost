"use client"; // R1 — announcement bar + sticky header with mega-feel nav + mobile menu.
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/areas", label: "Areas", hint: "10 guides" },
  { href: "/guides/single-room-self-contain", label: "Guides", hint: "Room types" },
  { href: "/calculator", label: "Calculator", hint: "True cost" },
  { href: "/rights", label: "Rights", hint: "Know the law" },
  { href: "/news", label: "News", hint: "Rent pulse" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gold px-4 py-1.5 text-center text-xs font-bold text-ink">
        ✓ Prices re-verified for September 2026 · <Link href="/areas" className="underline">Browse the benchmarks</Link>
      </div>
      <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="TrueCost home">
            <Image src="/images/logo-horizontal.png" alt="TrueCost" width={168} height={40} priority />
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="group rounded-lg px-3 py-2 transition hover:bg-ink-soft">
                <span className="text-slate-100 group-hover:text-gold">{l.label}</span>
                <span className="ml-1.5 hidden text-[11px] text-slate-400 2xl:inline">{l.hint}</span>
              </Link>
            ))}
            <Link href="/search" className="rounded-lg px-3 py-2 text-slate-100 transition hover:bg-ink-soft hover:text-gold" aria-label="Search">⌕</Link>
            <Link href="/get-help" className="btn-primary ml-2 whitespace-nowrap rounded-lg bg-gold px-4 py-2 font-semibold text-ink">
              Get Matched — Free
            </Link>
          </nav>
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/search" aria-label="Search" className="rounded-lg border border-ink-line p-2">⌕</Link>
            <button
              className="rounded-lg border border-ink-line p-2"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-ink-line px-4 pb-5 lg:hidden" aria-label="Mobile">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-ink-line/60 py-3.5 text-slate-100"
              >
                <span className="font-medium">{l.label}</span>
                <span className="text-xs text-slate-400">{l.hint} →</span>
              </Link>
            ))}
            <Link
              href="/get-help"
              onClick={() => setOpen(false)}
              className="btn-primary mt-4 block rounded-lg bg-gold px-4 py-3 text-center font-bold text-ink"
            >
              Get Matched — Free
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
