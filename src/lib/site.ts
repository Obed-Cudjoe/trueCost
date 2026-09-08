// Central site constants — edit here, reflected everywhere.
export const SITE = {
  name: "TrueCost",
  tagline: "Know the real cost of renting in Accra.",
  description:
    "TrueCost publishes verified rent benchmarks, living realities, and true move-in costs for Accra neighbourhoods — before agents or landlords quote you a price.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://truecost.vercel.app",
  whatsapp: "233200000000", // TODO: replace with owner's WhatsApp number (country code + number, no +)
  responsePromise: "within 24 hours",
};

// Calculator defaults — standard fee assumptions (editable; shown on /calculator).
export const FEE_DEFAULTS = {
  commissionRate: 0.1, // 10% agent commission on total advance
  viewingFee: 150, // GH₵ per viewing round
  movingFee: 400, // GH₵ average moving/logistics cost
};

// Budget ranges used by the lead form.
export const BUDGETS = ["Under GH₵800", "GH₵800–1,500", "GH₵1,500–3,000", "GH₵3,000–6,000", "Above GH₵6,000"];
