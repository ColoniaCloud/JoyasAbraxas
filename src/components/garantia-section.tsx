"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gem, Link2, ShieldCheck } from "lucide-react";

const PILLARS = [
  { icon: Gem, label: "Engaste y piedras" },
  { icon: Link2, label: "Broches y mecanismos" },
  { icon: ShieldCheck, label: "Metal y soldaduras" },
];

const SEAL_TEXT = "GARANTÍA ESCRITA · 2 AÑOS · ABRAXAS · ";

/** Bloque de confianza de la home: presenta la garantía de 2 años con poco texto. */
export default function GarantiaSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const reveal = (delay: number, y = 16): CSSProperties => ({
    transition: "opacity 800ms ease, transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : `translateY(${y}px)`,
  });

  return (
    <section
      ref={ref}
      aria-labelledby="garantia-home-title"
      className="relative w-full overflow-clip bg-black py-20 sm:py-24"
    >
      {/* Fondo: la misma foto del colgante, a sangre y bajo un velo muy oscuro */}
      <Image
        src="/ornament/slider/colgantes.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-[50%_45%]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/85" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        {/* Texto */}
        <div>
          <p
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-brand-strong)]"
            style={reveal(0, 10)}
          >
            Garantía Abraxas
          </p>

          <div className="flex items-end gap-5" style={reveal(120, 28)}>
            <span
              aria-hidden="true"
              className="font-heading bg-gradient-to-b from-[var(--color-brand-strong)] to-[var(--color-brand)] bg-clip-text font-light leading-[0.8] text-transparent lining-nums"
              style={{ fontSize: "clamp(6.5rem, 14vw, 10rem)" }}
            >
              2
            </span>
            <h2
              id="garantia-home-title"
              className="m-0 pb-3 font-light leading-[1.05] tracking-tight text-[var(--color-ink)]"
              style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.9rem)" }}
            >
              <span className="sr-only">2 </span>años de garantía
              <span className="block text-[var(--color-ink)]/55">en cada pieza.</span>
            </h2>
          </div>

          <p
            className="mt-7 max-w-[440px] text-[15px] leading-relaxed text-[var(--color-ink)]/65"
            style={reveal(220)}
          >
            Hechas a mano para durar. Si aparece un defecto de fabricación, lo reparamos o la reemplazamos.
          </p>

          <ul className="mt-9 grid max-w-[520px] gap-3 sm:grid-cols-3" style={reveal(320)}>
            {PILLARS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/70 px-4 py-3 sm:flex-col sm:items-start sm:gap-2.5"
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="shrink-0 text-[var(--color-brand-strong)]" />
                <span className="text-[13px] font-medium leading-snug text-[var(--color-ink)]/85">{label}</span>
              </li>
            ))}
          </ul>

          <div style={reveal(420)}>
            <Link
              href="/garantia"
              className="group mt-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand)] px-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-[var(--color-brand-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-strong)]"
            >
              Conocé la garantía
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Foto + sello */}
        <div className="relative mx-auto w-full max-w-[420px]" style={reveal(200, 32)}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-[var(--color-line)]">
            <Image
              src="/ornament/slider/colgantes.jpg"
              alt="Colgante artesanal de plata Abraxas"
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-cover object-[50%_45%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>

          {/* Sello circular */}
          <div
            aria-hidden="true"
            className="absolute -bottom-8 -left-3 size-32 rounded-full border border-[var(--color-brand)]/40 bg-[var(--color-background)]/90 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:-left-10 sm:size-36"
          >
            <svg viewBox="0 0 100 100" className="size-full motion-safe:animate-[spin_24s_linear_infinite]">
              <defs>
                <path id="garantia-seal-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text className="fill-[var(--color-ink)]" style={{ fontSize: "8.6px", letterSpacing: "1.6px" }}>
                <textPath href="#garantia-seal-path">{SEAL_TEXT}</textPath>
              </text>
            </svg>
            <ShieldCheck
              size={30}
              strokeWidth={1.4}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-brand-strong)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
