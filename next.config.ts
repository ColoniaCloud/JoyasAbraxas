import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      // URL corta de la campaña de Navidad (redes) → selección de regalos. Temporal: cambia cada temporada.
      { source: "/navidad", destination: "/destacados", permanent: false },
    ];
  },
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
