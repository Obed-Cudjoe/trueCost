// Root layout (R1/R2/R9 shell) + global SEO defaults. Every page inherits this.
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { SITE } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/images/og.png"],
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description, images: ["/images/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH">
      <body>
        <Header />
        <main className="mx-auto min-h-[60vh] w-full max-w-6xl px-4 py-8">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
