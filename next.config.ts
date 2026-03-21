import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 1080, 1920],
    imageSizes: [32, 64, 128, 256],
    minimumCacheTTL: 2592000,
    formats: ['image/webp'],
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.saavncdn.com',
      },
    ],
  },
};

export default nextConfig;
