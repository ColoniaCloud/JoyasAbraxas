import { ImageResponse } from "next/og";

// Imagen Open Graph por defecto para todo el sitio (1200x630).
// Las fichas de producto/blog que definen su propia og:image la sobreescriben.
export const alt = "Abraxas Joyería — joyería artesanal de alta calidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 30%, #200e0d 0%, #090807 60%)",
          color: "#ede7df",
        }}
      >
        <div
          style={{
            fontSize: 130,
            fontWeight: 700,
            letterSpacing: 24,
            paddingLeft: 24,
            color: "#ede7df",
          }}
        >
          ABRAXAS
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 34,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#C05046",
          }}
        >
          Joyería
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 28,
            color: "#68625b",
          }}
        >
          Joyería artesanal de alta calidad · Uruguay
        </div>
      </div>
    ),
    { ...size },
  );
}
