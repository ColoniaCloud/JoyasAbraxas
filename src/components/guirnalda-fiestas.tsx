"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { guirnaldaJoyeroSvg, VARIANTES_JOYERO } from "@/lib/guirnalda-joyero";

// El SVG es determinístico: se arma una sola vez y es igual en servidor y cliente.
const SVG_ESCRITORIO = guirnaldaJoyeroSvg({ ...VARIANTES_JOYERO.escritorio, claseEstrella: "gj-estrella" });
const SVG_CELULAR = guirnaldaJoyeroSvg({ ...VARIANTES_JOYERO.celular, claseEstrella: "gj-estrella" });

/**
 * Guirnalda de cadenas de oro, perlas y estrellas colgando bajo el header.
 * Solo se ve arriba de todo de la página y se oculta si hay un menú abierto,
 * para no tapar contenido. Es decorativa: no recibe clics ni la leen los lectores de pantalla.
 */
export default function GuirnaldaFiestas({ hidden = false }: { hidden?: boolean }) {
  const [arriba, setArriba] = useState(true);

  useEffect(() => {
    const onScroll = () => setArriba(window.scrollY <= 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-1/2 top-full w-screen -translate-x-1/2 -translate-y-[6px] transition-opacity duration-500",
        arriba && !hidden ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="hidden md:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: SVG_ESCRITORIO }}
      />
      <div
        className="md:hidden [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: SVG_CELULAR }}
      />
    </div>
  );
}
