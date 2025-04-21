/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === 'true' || process.env.VERCEL === '1';

console.log(`Building for: ${isProd ? 'Production' : 'Development'} | Vercel: ${isVercel}`);

const nextConfig = {
  output: isProd ? 'standalone' : undefined,
  reactStrictMode: true,
  swcMinify: true, // Use SWC minification for better performance
  
  images: {
    domains: ['localhost'],
    unoptimized: false, // Always optimize images for better performance
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
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Only enable these optimizations in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        realContentHash: true, // Add content hash based on file contents
        flagIncludedChunks: true,
      };
    }
    
    return config;
  },
  
  experimental: {
    // Enable features to improve build process
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig; 