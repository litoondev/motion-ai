import type { NextConfig } from "next";

/**
 * Static export: `npm run build` writes a plain HTML/CSS/JS site to ./out
 * that can be uploaded to any web server (Apache, Nginx, shared hosting, S3 ...).
 *
 *  - no Node.js server is needed in production
 *  - the API URL is read at BUILD time from NEXT_PUBLIC_API_URL
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // /login/ -> out/login/index.html (works on every static host)
  images: { unoptimized: true }, // the image optimizer needs a server
  reactStrictMode: true,
};

export default nextConfig;
