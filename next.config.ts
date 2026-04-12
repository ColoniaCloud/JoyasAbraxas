import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
