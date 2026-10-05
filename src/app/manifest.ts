import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rhoam | Student Apartments Near You",
    short_name: "Rhoam",
    description:
      "Nigeria's map-first platform for discovering student accommodation",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Matches the app's established brand coral used throughout the UI
    // (search accents, active category chips, the user-location pin).
    background_color: "#ffffff",
    theme_color: "#ff5a5f",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
