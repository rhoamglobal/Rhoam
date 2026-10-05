import "./globals.css";
import "leaflet/dist/leaflet.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";

import type { Metadata, Viewport } from "next";

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

  // manifest.ts (App Router's native convention) handles the actual
  // <link rel="manifest">, background_color, and standard icons for
  // Android/Chrome. iOS Safari ignores most of that manifest, so it
  // needs this separate, older set of tags to get the same "added to
  // home screen" treatment — full-screen, no browser chrome, a proper
  // icon instead of a screenshot thumbnail.
  appleWebApp: {
    capable: true,
    title: "Rhoam",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  // Next's typed appleWebApp.capable only emits the modern
  // "mobile-web-app-capable" tag. iOS Safari hasn't adopted that
  // renamed standard yet — it still specifically checks for the old
  // Apple-prefixed name, and without it "Add to Home Screen" opens as
  // an ordinary browser tab (with address bar) instead of full-screen,
  // which defeats the point of installing it at all on iOS.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  // Matches the brand coral used throughout the UI — colors the browser
  // chrome/status bar on Android when installed.
  themeColor: "#ff5a5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
      <ServiceWorkerRegister />
      <AuthProvider>
          <LayoutWrapper>
            <ToastProvider>
              {children}
              <InstallPrompt />
            </ToastProvider>
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}