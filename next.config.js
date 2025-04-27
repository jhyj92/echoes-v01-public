/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: false, // 👈 DISABLE App Router to use Pages Router correctly
  },
};

module.exports = nextConfig;
