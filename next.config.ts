import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.joyasabraxas.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
