import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    return [
      { source: '/reports', destination: '/', permanent: false },
      { source: '/reports/:path*', destination: '/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
