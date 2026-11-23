import { estrellaSueltaSvg } from "@/lib/guirnalda-joyero";

/**
 * Estrellas facetadas (las de la guirnalda) flotando con parallax detrás del contenido.
 * Reglas: pocas, solo en zonas oscuras con foto, nunca sobre tarjetas de producto;
 * las lejanas son chicas, desenfocadas y se mueven poco. El movimiento lo da el
 * scroll (CSS scroll-driven animations); sin soporte o con «reducir movimiento»
 * quedan quietas. En celular se muestra la mitad.
 */

interface Estrella {
  /** Posición horizontal en % dentro de la sección */
  left: number;
  /** Posición vertical (CSS). En las colecciones va en px para no bajar nunca hasta el carrusel. */
  top: string;
  /** Tamaño en px */
  size: number;
  /** Profundidad 0 (lejos) a 1 (cerca): define desenfoque, opacidad y recorrido */
  depth: number;
  /** Visible también en celular */
  mobile?: boolean;
}

// Colecciones: el carrusel empieza a ~220px, así que posición + tamaño + recorrido
// del parallax queda siempre por encima de ~185px.
const LADO_DERECHO: Estrella[] = [
  { left: 62, top: "30px", size: 34, depth: 0.9, mobile: true },
  { left: 84, top: "20px", size: 18, depth: 0.3 },
  { left: 76, top: "90px", size: 24, depth: 0.55, mobile: true },
  { left: 92, top: "60px", size: 14, depth: 0.15 },
];

// Espejo para las secciones con el texto a la derecha
const LADO_IZQUIERDO: Estrella[] = LADO_DERECHO.map((e) => ({ ...e, left: 100 - e.left - 4 }));

// Hero: texto abajo a la izquierda y flechas abajo a la derecha → estrellas arriba a la derecha
const HERO: Estrella[] = [
  { left: 70, top: "30%", size: 38, depth: 0.95, mobile: true },
  { left: 86, top: "22%", size: 20, depth: 0.35 },
  { left: 58, top: "46%", size: 16, depth: 0.2 },
  { left: 90, top: "48%", size: 26, depth: 0.6, mobile: true },
];

const SETS = { derecha: LADO_DERECHO, izquierda: LADO_IZQUIERDO, hero: HERO };

export default function EstrellasParallax({
  lado,
  seed,
}: {
  lado: keyof typeof SETS;
  /** Identificador único por sección (evita ids repetidos en los degradés) */
  seed: string;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
      {SETS[lado].map((e, i) => (
        <span
          key={i}
          className={`ep-estrella absolute ${e.mobile ? "" : "hidden md:block"}`}
          style={
            {
              left: `${e.left}%`,
              top: e.top,
              width: e.size,
              height: e.size,
              opacity: 0.45 + e.depth * 0.45,
              filter: e.depth < 0.4 ? `blur(${((0.4 - e.depth) * 4).toFixed(1)}px)` : undefined,
              "--ep-dist": `${Math.round(20 + e.depth * 90)}px`,
            } as React.CSSProperties
          }
          dangerouslySetInnerHTML={{
            __html: estrellaSueltaSvg(`ep-${seed}-${i}`).replace(
              'width="80" height="80"',
              'width="100%" height="100%"'
            ),
          }}
        />
      ))}
    </div>
  );
}
