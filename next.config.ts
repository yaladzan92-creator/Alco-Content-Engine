import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@google/genai'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    '*',
    '*.run.app',
    '*.googleusercontent.com',
    'aistudio.google.com',
    'localhost:*',
    '127.0.0.1:*',
  ],
};

export default nextConfig;

