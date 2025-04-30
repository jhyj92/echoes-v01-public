// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow use of AVIF/WebP and built-in loader
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
