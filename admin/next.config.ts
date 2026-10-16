import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      ...(process.env.API_IMAGE_DOMAIN
        ? [{ protocol: "https" as const, hostname: process.env.API_IMAGE_DOMAIN }]
        : []),
    ],
  },
};

export default nextConfig;
