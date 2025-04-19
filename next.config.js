/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config) => {
    return config;
  },
  // Allow connections from all hosts in development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Explicitly specify page extensions to exclude unwanted routes
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  
  // Fix fallback routing for conflicting dynamic routes
  async rewrites() {
    return {
      beforeFiles: [
        // Redirect any page with 'id' in the pathname to prevent conflicts
        {
          source: '/admin/users/:path*',
          destination: '/admin/users/:path*',
          has: [
            {
              type: 'query',
              key: 'id'
            }
          ]
        }
      ]
    };
  },
  
  // Exclude dynamic pages from export
  experimental: {
    // This option is no longer needed in newer versions of Next.js
    // appDir: true,
  },
};

module.exports = nextConfig; 