import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors won't block builds either
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

