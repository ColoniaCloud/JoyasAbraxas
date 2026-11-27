"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

/** Verde pino de la página de Navidad */
const VERDE = "15 42 30";

/** Cada capa se mueve a una velocidad distinta: las lejanas, lento y tenues; las cercanas, rápido y más brillantes. */
const CAPAS = [
  { velocidad: 0.12, cantidad: 70, tamano: [4, 8], opacidad: [0.25, 0.5] },
  { velocidad: 0.28, cantidad: 40, tamano: [8, 13], opacidad: [0.4, 0.7] },
  { velocidad: 0.5, cantidad: 18, tamano: [13, 20], opacidad: [0.55, 0.9] },
] as const;

/** PRNG con semilla: las estrellas salen iguales en el servidor y en el cliente (sin desajuste de hidratación). */
function aleatorio(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const ESTRELLAS = CAPAS.map((capa, i) => {
  const azar = aleatorio(20261225 + i * 97);
  const rango = (min: number, max: number) => min + azar() * (max - min);
  return Array.from({ length: capa.cantidad }, () => ({
    left: rango(0, 100),
    // La capa sube al hacer scroll: se reparte más abajo de la página para que no quede vacía al final
    top: rango(0, 100 + capa.velocidad * 100),
    size: rango(capa.tamano[0], capa.tamano[1]),
    opacity: rango(capa.opacidad[0], capa.opacidad[1]),
    titila: azar() < 0.35,
    retraso: rango(0, 4),
    duracion: rango(2.5, 5),
    destello: azar() < 0.7, // destello de 4 puntas; el resto, punto de luz
  }));
});

function Estrella({ e }: { e: (typeof ESTRELLAS)[number][number] }) {
  return (
    <span
      className="absolute"
      style={{ left: `${e.left}%`, top: `${e.top}%`, width: e.size, height: e.size, opacity: e.opacity }}
    >
      {/* El titileo va en un hijo para no pisar la opacidad base de la estrella */}
      <span
        className={e.titila ? "navidad-titila flex size-full items-center justify-center" : "flex size-full items-center justify-center"}
        style={e.titila ? { animationDelay: `${e.retraso}s`, animationDuration: `${e.duracion}s` } : undefined}
      >
      {e.destello ? (
        <svg viewBox="0 0 24 24" className="size-full drop-shadow-[0_0_4px_rgba(242,226,187,0.7)]">
          <path d="M12 0c.6 6.5 5.5 11.4 12 12-6.5.6-11.4 5.5-12 12-.6-6.5-5.5-11.4-12-12C6.5 11.4 11.4 6.5 12 0Z" fill="#f2e2bb" />
        </svg>
      ) : (
        <span className="block size-1/2 rounded-full bg-[#f2e2bb] shadow-[0_0_6px_2px_rgba(242,226,187,0.55)]" />
      )}
      </span>
    </span>
  );
}

/**
 * Escena de la página /navidad: foto fija de fondo bajo un velo verde y estrellas en parallax.
 * - La foto queda fija (recortada a la página con clip-path, así no tapa header ni footer).
 * - El degradé verde arranca a la altura del hero y baja con el scroll, revelando la foto completa.
 * - Con prefers-reduced-motion no hay parallax ni titileo: queda el estado final, legible.
 */
export default function NavidadEscena({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);
  const capas = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--revela", "1");
      return;
    }

    let frame = 0;
    const actualizar = () => {
      frame = 0;
      const y = window.scrollY;
      const revela = Math.min(1, Math.max(0, y / (window.innerHeight * 0.9)));
      el.style.setProperty("--revela", revela.toFixed(3));
      capas.current.forEach((capa, i) => {
        if (capa) capa.style.transform = `translate3d(0, ${(-y * CAPAS[i].velocidad).toFixed(1)}px, 0)`;
      });
    };
    const alScroll = () => {
      if (!frame) frame = requestAnimationFrame(actualizar);
    };

    actualizar();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // -mt-36/pt-36: el layout reserva 144px para el header fijo; la escena sube a cubrirlos para que el header comparta fondo
  return (
    <div
      ref={raiz}
      className="relative isolate -mt-36 overflow-hidden bg-[#0f2a1e] pt-36 [clip-path:inset(0)] [--revela:0]">
      {/* Foto fija + velo verde */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20">
        <Image
          src="/navidad/fondo-rosa.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[55%_32%]"
        />
        {/* Velo base: siempre bastante opaco */}
        <div className="absolute inset-0" style={{ backgroundColor: `rgb(${VERDE} / 0.7)` }} />
        {/* Degradé a verde sólido: al hacer scroll sus cortes bajan y aparece la foto en todo el alto */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgb(${VERDE} / 0) calc(45% + 55% * var(--revela)), rgb(${VERDE}) calc(100% + 30% * var(--revela)))`,
          }}
        />
      </div>

      {/* Estrellas en parallax (detrás del contenido) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {ESTRELLAS.map((estrellas, i) => (
          <div
            key={i}
            ref={(n) => {
              capas.current[i] = n;
            }}
            className="absolute inset-0 will-change-transform"
          >
            {estrellas.map((e, j) => (
              <Estrella key={j} e={e} />
            ))}
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}
