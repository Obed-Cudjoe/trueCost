// Central site constants — edit here, reflected everywhere.

export const CANONICAL_SITE_URL = "https://trucost.netlify.app";

// Keep SEO output on the intended production host. A different build-time value is
// deliberately ignored until the owner changes the canonical host in this file.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
const siteUrl = configuredUrl === CANONICAL_SITE_URL ? configuredUrl : CANONICAL_SITE_URL;

export const SITE = {
  name: "TrueCost",
  tagline: "Know the real cost of renting in Accra.",
  description:
    "TrueCost publishes date-stamped rent benchmarks, living realities, and planning costs for Accra neighbourhoods — with the limits of the data shown clearly.",
  url: siteUrl,
  whatsapp: "233531262424", // owner's WhatsApp (country code + number, no +)
  phoneDisplay: "053 126 2424",
  email: "cudjoe.obed.gh@gmail.com",
  linkedin: "https://www.linkedin.com/in/obed-cudjoe",
};

/** Build a canonical absolute URL from a site-relative path. */
export function canonicalUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE.url}${path === "/" ? "/" : path}`;
}

// Calculator defaults — planning assumptions, not quoted market facts.
export const FEE_DEFAULTS = {
  commissionRate: 0.1, // editable assumption shown on /calculator
  viewingFee: 150, // editable planning assumption
  movingFee: 400, // editable planning assumption
};

// Partner pricing — shown on /list-property + agent pitch. Single source of truth.
export const PARTNER_PRICING = {
  freeMatches: 2,
  perMatch: "GH₵50–100",
  monthly: "GH₵300–500",
  featured: "GH₵200",
  listing: "Free",
};

// Budget ranges used by the lead form. The server validates against this list too.
export const BUDGETS = ["Under GH₵800", "GH₵800–1,500", "GH₵1,500–3,000", "GH₵3,000–6,000", "Above GH₵6,000"] as const;

export const PARTNER_ROLES = ["agent", "landlord", "developer"] as const;
export const PARTNER_PROPERTY_TYPES = [
  "Single room self-contain",
  "Chamber & hall s/c",
  "2-bedroom apartment",
  "2-bedroom house",
  "3+ bedroom",
  "Shop / office space",
  "Land",
] as const;

export const CONTACT_TOPICS = ["question", "correction", "partnership", "other"] as const;
