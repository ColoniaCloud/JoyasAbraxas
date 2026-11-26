"use client";

import { useState, useEffect, useCallback, useRef, type TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EstrellasParallax from "@/components/estrellas-parallax";

export interface HeroSlide {
  image: string;
  title: string;
  tagline: string;
  href: string;
  buttonLabel?: string;
  /** Slide de campaña: botón champagne y foco de la imagen a la derecha */
  variant?: "fiestas";
  /** Recorte de la foto (object-position) */
  focus?: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  /** Decoración de Fiestas */
  festive?: boolean;
}

export default function HeroSlider({ slides, festive = false }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || total === 0) return;
      setIsTransitioning(true);
      setCurrent((index + total) % total);
      setTimeout(() => setIsTransitioning(false), 900);
    },
    [isTransitioning, total]
  );

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Swipe táctil
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 9000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (total === 0) return null;

  return (
    <section
      className={cn(
        "relative w-full touch-pan-y overflow-clip bg-black",
        // Con la guirnalda de Fiestas el hero crece a 85vh para que la decoración no pise el texto del slide.
        festive
          ? "h-[85vh] min-h-[560px]"
          : "h-[70vh] min-h-[480px] md:h-[60vh] md:min-h-[400px]",
      )}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background images */}
      {slides.map((slide, i) => (
        <div
          key={slide.image}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className={cn(
              "object-cover",
              i === current && "animate-scale-in"
            )}
            style={slide.focus ? { objectPosition: slide.focus } : undefined}
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
          {slide.variant === "fiestas" && (
            // Velo a la izquierda para que el título no compita con las joyas de la foto
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:via-black/25" />
          )}
        </div>
      ))}

      {festive && <EstrellasParallax lado="hero" seed="hero" />}

      {/* Content — key={current} fuerza remount y reanima en cada cambio */}
      <div className="relative z-10 flex h-full items-end pb-24 md:pb-20">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          <div key={current} className="max-w-[580px]">
            <p className="animate-fade-in delay-100 mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-white/55">
              Joyería Abraxas
            </p>
            <h2
              className={cn(
                "animate-fade-in-up delay-200 mb-4 text-[clamp(2rem,4.5vw,3.8rem)] font-light leading-[1.08] tracking-tight text-white",
                // Dos líneas para que el título quede a la izquierda de las joyas de la foto
                slides[current].variant === "fiestas" && "max-w-[15ch] [text-wrap:balance]"
              )}
            >
              {slides[current].title}
            </h2>
            <p className="animate-fade-in-up delay-300 mb-8 max-w-[460px] text-[15px] leading-relaxed text-white/70">
              {slides[current].tagline}
            </p>
            <div className="animate-fade-in-up delay-450">
              <Link
                href={slides[current].href}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-none border px-9 py-3.5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all focus-visible:outline-2 focus-visible:outline-offset-4",
                  slides[current].variant === "fiestas"
                    ? "border-[#dcc08a] bg-[#dcc08a] text-[#1a1208]! hover:border-[#f2e2bb] hover:bg-[#f2e2bb] focus-visible:outline-[#f2e2bb]"
                    : "border-[var(--color-brand)] bg-[var(--color-brand)] text-white hover:border-[var(--color-brand-strong)] hover:bg-[var(--color-brand-strong)] focus-visible:outline-white"
                )}
              >
                {slides[current].buttonLabel ?? "Ver colección"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows + Dots */}
      {total > 1 && (
        <div className="absolute bottom-8 right-6 z-20 flex items-center gap-4 md:right-10">
          <button
            onClick={prev}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/50"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/50"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2.5 md:left-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group flex h-7 cursor-pointer items-center border-0 bg-transparent"
              aria-label={`Ir a slide ${i + 1}`}
              aria-current={i === current}
            >
              <span
                className={cn(
                  "block h-[2px] rounded-full transition-all duration-500",
                  i === current
                    ? "w-8 bg-white"
                    : "w-4 bg-white/40 group-hover:bg-white/60"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
