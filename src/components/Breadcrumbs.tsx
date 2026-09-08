// R3 — breadcrumbs with SEO microdata.
import Link from "next/link";

export default function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">›</span>}
            {t.href ? (
              <Link href={t.href} className="hover:text-gold-deep hover:underline">{t.label}</Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">{t.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
