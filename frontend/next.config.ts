import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Images are limited to 5 MB; leave room for the remaining multipart fields.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8088", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8088", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
