import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.ALCO_NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
};

export default nextConfig;


