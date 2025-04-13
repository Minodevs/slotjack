/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  output: 'standalone',
  reactStrictMode: true,
};

module.exports = nextConfig; 