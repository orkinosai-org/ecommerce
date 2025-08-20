/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'example.com'],
    unoptimized: true, // For development with mock images
  },
};

module.exports = nextConfig;
