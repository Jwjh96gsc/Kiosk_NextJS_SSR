import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'poster.gsc.com.my',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

