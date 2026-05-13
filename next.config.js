/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@imajin/ui', '@imajin/db'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.imajin.ai',
      },
    ],
  },
};

module.exports = nextConfig;
