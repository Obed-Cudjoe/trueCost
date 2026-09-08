// R2 — footer on every page: nav columns, promise line, legal links.
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Image src="/images/logo-white.png" alt="TrueCost" width={150} height={44} />
          <p className="mt-4 text-sm leading-relaxed">
            Real prices, real living conditions — before agents or landlords quote you.
          </p>
        </div>
        <nav aria-label="Explore">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-gold" href="/areas">Area guides</Link></li>
            <li><Link className="hover:text-gold" href="/calculator">Cost calculator</Link></li>
            <li><Link className="hover:text-gold" href="/rights">Tenant rights</Link></li>
            <li><Link className="hover:text-gold" href="/news">Rent news</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-gold" href="/about">About + method</Link></li>
            <li><Link className="hover:text-gold" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-gold" href="/get-help">Get matched</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-gold" href="/privacy">Privacy policy</Link></li>
            <li><Link className="hover:text-gold" href="/terms">Terms of use</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-700 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} TrueCost · Prices verified quarterly · General guidance, not legal advice.
      </div>
    </footer>
  );
}
