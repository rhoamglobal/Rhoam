import "./globals.css";
import "leaflet/dist/leaflet.css";
import BottomNav from "@/components/navigation/BottomNav";

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
      <body>{children}
      <BottomNav />
      </body>
    </html>
  );
}