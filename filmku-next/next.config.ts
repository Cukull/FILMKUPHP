import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors won't block builds either
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
  },
};

export default nextConfig;

