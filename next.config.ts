/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-82c3ab18e1404c4c8c7f8d56c35088f5.r2.dev",
        port: "", // Leave empty if no specific port is used
        pathname: "/**", // Match all paths
      },
    ],
  },
};

module.exports = nextConfig;
