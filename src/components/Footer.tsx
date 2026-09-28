// R2 — rich footer: brand + method, top areas, explore, company/legal.
import Link from "next/link";
import Image from "next/image";

const TOP_AREAS = ["spintex", "kasoa", "madina", "east-legon", "osu", "achimota"];

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-slate-300">
      <div className="border-b border-ink-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center md:flex-row md:text-left">
          <p className="font-display text-xl text-white">
            We publish the ranges, questions, and limits. <span className="text-gold">You verify before you pay.</span>
          </p>
          <Link href="/about" className="btn-ghost shrink-0 rounded-lg border border-slate-500 px-5 py-2.5 text-sm font-semibold text-white">
            Our method →
          </Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Image src="/images/logo-white.png" alt="TrueCost" width={150} height={44} />
          <p className="mt-4 text-sm leading-relaxed">
            Date-stamped rent information and planning tools for Accra — without pretending an undocumented estimate is certainty.
          </p>
          <p className="mt-3 inline-block rounded-full bg-leaf-soft px-3 py-1 text-xs font-bold text-leaf">
            ✓ Check dates shown on each page
          </p>
        </div>
        <nav aria-label="Top areas">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Top areas</h3>
          <ul className="space-y-2 text-sm">
            {TOP_AREAS.map((s) => (
              <li key={s}><Link className="capitalize hover:text-gold" href={`/areas/${s}`}>{s.replace("-", " ")}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Explore">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-gold" href="/areas">All area guides</Link></li>
            <li><Link className="hover:text-gold" href="/calculator">Cost calculator</Link></li>
            <li><Link className="hover:text-gold" href="/rights">Tenant rights</Link></li>
            <li><Link className="hover:text-gold" href="/news">Rent news</Link></li>
            <li><Link className="hover:text-gold" href="/search">Search</Link></li>
            <li><Link className="hover:text-gold" href="/listings">Partner listings</Link></li>
            <li><Link className="hover:text-gold" href="/list-property">Submit a property</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-gold" href="/about">About + method</Link></li>
            <li><Link className="hover:text-gold" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-gold" href="/get-help">Get help</Link></li>
            <li><Link className="hover:text-gold" href="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-gold" href="/terms">Terms</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-ink-line py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} TrueCost · Check dates and assumptions before paying · General information, not legal advice.
      </div>
    </footer>
  );
}
