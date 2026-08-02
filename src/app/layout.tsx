import "./globals.css";
import "leaflet/dist/leaflet.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rhoam.ng"), // change to your domain when live

  title: {
    default: "RHOAM",
    template: "%s | RHOAM",
  },

  description:
    "Nigeria's map-first platform for discovering student accommodation, apartments, shortlets and hotels.",

  keywords: [
    "RHOAM",
    "Student Accommodation",
    "Apartments",
    "Shortlets",
    "Hotels",
    "Property",
    "Nigeria",
    "ESUT",
    "UNN",
    "Map",
  ],

  openGraph: {
    title: "RHOAM",
    description:
      "Find verified student accommodation, apartments, shortlets and hotels on one interactive map.",

    siteName: "RHOAM",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "RHOAM",
    description:
      "Discover verified properties on RHOAM.",
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