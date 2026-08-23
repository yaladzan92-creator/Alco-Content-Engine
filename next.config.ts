import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const nextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
  reactStrictMode: true,
  serverExternalPackages: ['@google/genai'],
  ...(isDev ? { distDir: '.next-dev' } : {}),
  eslint: {
    // Jalankan linting secara terpisah via npm run lint agar tidak membebani I/O proses bundler
    ignoreDuringBuilds: true,
  },
  onDemandEntries: {
    // Pertahankan entri halaman di memori lebih lama untuk mencegah chunk evict/reload collision
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  allowedDevOrigins: [
    '*',
    '*.run.app',
    '*.googleusercontent.com',
    'aistudio.google.com',
    'localhost:*',
    '127.0.0.1:*',
  ],
  webpack: (config, { dev }) => {
    if (dev) {
      // Nonaktifkan filesystem cache Webpack di mode dev untuk mencegah race condition & file lock pada container
      config.cache = false;
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**'],
      };
    }
    return config;
  },
};
};

export default nextConfig;
