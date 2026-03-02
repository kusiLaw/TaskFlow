import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy to Django
      },
    ];
  },
  // Allow cookies from localhost
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },

  allowedDevOrigins: [ 'http://127.0.0.1:3000'], // Allow requests from localhost:3000 during development

};

export default nextConfig;
