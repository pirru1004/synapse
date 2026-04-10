import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure Vercel native configuration
  reactStrictMode: true,
  // Required for Azure Static Web Apps standalone deployment
  output: "standalone",
};

export default nextConfig;
