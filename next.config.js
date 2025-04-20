/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true, // Use SWC minification for better performance
  
  images: {
    domains: ['localhost', 'dulcet-tanuki-9e2ad9.netlify.app'],
    unoptimized: !isProd, // Only optimize in production
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
  
  // Fix fallback routing for conflicting dynamic routes
  async rewrites() {
    return {
      beforeFiles: [
        // Redirect any page with 'id' in the pathname to prevent conflicts
        {
          source: '/admin/users/[id]',
          destination: '/admin/users/:userId*',
        }
      ]
    };
  },
  
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
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 