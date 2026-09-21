import type { Metadata, Viewport } from "next";
import { Allura, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { WEDDING } from "@/lib/wedding";

const allura = Allura({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sahana & Krishna Teja | Wedding Invitation",
  description: `Wedding invitation of ${WEDDING.bride} and ${WEDDING.groom} — ${WEDDING.dateDisplay}, Austin, Texas. Muhurtham 6:58 PM at ${WEDDING.venue}.`,
  metadataBase: new URL("https://sahana-krishna-wedding-webpage.vercel.app"),
  openGraph: {
    title: "Sahana & Krishna Teja — Wedding Invitation",
    description: `Together with their families, joyfully invite you — ${WEDDING.dateDisplay}, ${WEDDING.venue}, Liberty Hill, Texas.`,
    type: "website",
    images: [{ url: "/wedding-frame.jpg", width: 1024, height: 1536, alt: "Sahana and Krishna Teja wedding frame" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahana & Krishna Teja — Wedding Invitation",
    description: `${WEDDING.dateDisplay} · ${WEDDING.venue} · Liberty Hill, Texas`,
    images: ["/wedding-frame.jpg"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💛</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8eee2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Wedding of ${WEDDING.bride} and ${WEDDING.groom}`,
    startDate: WEDDING.dateISO,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: WEDDING.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: "326 Rio Pk Dr",
        addressLocality: "Liberty Hill",
        addressRegion: "TX",
        postalCode: "78642",
        addressCountry: "US",
      },
    },
    description: `Wedding ceremony of ${WEDDING.bride} and ${WEDDING.groom}. ${WEDDING.muhurtham}.`,
  };

  return (
    <html lang="en" className={`${allura.variable} ${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <a className="skip-link" href="#details">
          Skip to invitation details
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
