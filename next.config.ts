import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: [
    '*.run.app',
    '*.google.com',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


