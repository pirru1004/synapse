import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/synapse",
  assetPrefix: "/synapse",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
