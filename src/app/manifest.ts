import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abraxas Joyería",
    short_name: "Abraxas",
    description: "Joyería artesanal de alta calidad en Uruguay",
    start_url: "/",
    display: "standalone",
    background_color: "#090807",
    theme_color: "#200e0d",
    icons: [
      {
        src: "https://api.joyasabraxas.com/wp-content/uploads/2023/09/cropped-logo_n.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
