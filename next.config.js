/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    formats: ["image/avif", "image/webp"],
    domains: [
      "localhost",
    ],
  },

  // Remove the entire experimental block
  // experimental: {
  //   appDir: true,
  // },
};

module.exports = nextConfig;
