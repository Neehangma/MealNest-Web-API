import type { NextConfig } from "next";

const uploadRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "http", hostname: "localhost", port: "8088", pathname: "/uploads/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8088", pathname: "/uploads/**" },
];

if (process.env.NEXT_PUBLIC_API_URL) {
  const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
  if (apiUrl.protocol === "http:" || apiUrl.protocol === "https:") {
    uploadRemotePatterns.push({
      protocol: apiUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      pathname: "/uploads/**",
    });
  }
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Images are limited to 5 MB; leave room for the remaining multipart fields.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: uploadRemotePatterns,
  },
};

export default nextConfig;
