/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@components": require("path").resolve(__dirname, "components"),
      "@utils": require("path").resolve(__dirname, "utils"),
      "@hooks": require("path").resolve(__dirname, "hooks"),
      "@styles": require("path").resolve(__dirname, "styles")
    };
    return config;
  }
};
module.exports = nextConfig;
