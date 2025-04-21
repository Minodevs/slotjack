/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === 'true' || process.env.VERCEL === '1';

console.log(`Building for: ${isProd ? 'Production' : 'Development'} | Vercel: ${isVercel}`);

const nextConfig = {
  output: isProd ? 'standalone' : undefined,
  reactStrictMode: true,
  
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Explicitly specify page extensions to exclude unwanted routes
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  
  // Disable the X-Powered-By header
  poweredByHeader: false,
  
  // Enable compression for better performance
  compress: true,
  
  // Set security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  }
};

module.exports = nextConfig; 