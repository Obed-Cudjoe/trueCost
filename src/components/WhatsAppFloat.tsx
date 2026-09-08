// R9 — floating WhatsApp button (Ghana's default contact channel).
import { SITE } from "@/lib/site";

export default function WhatsAppFloat() {
  const href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi TrueCost — I have a question about renting in Accra.")}`;
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl shadow-xl transition hover:scale-105"
    >
      ✆
    </a>
  );
}
