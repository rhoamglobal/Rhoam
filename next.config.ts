import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.nairaland.com" }, // ✅ add this
    ],
  },
};

module.exports = nextConfig;
