import "./globals.css";
import "leaflet/dist/leaflet.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata = {
  title: "Rhoam",
  description: "Map-first rental discovery",
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