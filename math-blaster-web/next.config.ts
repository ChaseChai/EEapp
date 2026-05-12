import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/MathBlaster",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
