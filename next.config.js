/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
      optimizePackageImports: ['antd'],
  },
};

module.exports = nextConfig;
