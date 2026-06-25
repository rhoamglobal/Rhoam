const nextConfig = {
  images: {
    remotePatterns: [
      // supported links
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.nairaland.com" }, // ✅ add this
      {
        protocol: "https",
        hostname: "paxmlrahjmcozhyixpjd.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
