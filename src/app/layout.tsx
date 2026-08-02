import "./globals.css";
import "leaflet/dist/leaflet.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rhoam.ng"),
  title: {
    default: "Rhoam | Student Apartments Near You", // changed
    template: "%s | RHOAM",
  },
  description:
    "Nigeria's map-first platform for discovering student accommodation", // use your OG description here too

  openGraph: {
    url: 'https://rhoam.ng',
    title: "Rhoam | Student Apartments Near You", // match
    description:
      "Nigeria's map-first platform for discovering student accommodation",
    siteName: "RHOAM",
    images: [
      {
        url: '/rhoam-logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Rhoam - Map-first rentals in Nigeria',
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Rhoam | Student Apartments Near You", // match
    description:
      "Discover verified properties on RHOAM.",
    images: ['/rhoam-logo.jpeg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
      <AuthProvider>
          <LayoutWrapper>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}