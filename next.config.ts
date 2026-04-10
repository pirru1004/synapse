import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure Vercel native configuration
  reactStrictMode: true,
  // Static export for GitHub Pages
  output: "export",
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
