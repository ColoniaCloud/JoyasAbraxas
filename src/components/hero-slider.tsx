"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  image: string;
  title: string;
  tagline: string;
  href: string;
  buttonLabel?: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
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

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 9000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (total === 0) return null;

  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-black md:h-[60vh] md:min-h-[400px]">
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
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
        </div>
      ))}

      {/* Content — key={current} fuerza remount y reanima en cada cambio */}
      <div className="relative z-10 flex h-full items-end pb-16 md:pb-20">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          <div key={current} className="max-w-[580px]">
            <p className="animate-fade-in delay-100 mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-white/55">
              Joyería Abraxas
            </p>
            <h1 className="animate-fade-in-up delay-200 mb-4 text-[clamp(2rem,4.5vw,3.8rem)] font-light leading-[1.08] tracking-tight text-white">
              {slides[current].title}
            </h1>
            <p className="animate-fade-in-up delay-300 mb-8 max-w-[460px] text-[15px] leading-relaxed text-white/70">
              {slides[current].tagline}
            </p>
            <div className="animate-fade-in-up delay-450">
              <Link
                href={slides[current].href}
                className="inline-flex items-center justify-center rounded-none border border-[var(--color-brand)] bg-[var(--color-brand)] px-9 py-3.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-brand-strong)] hover:border-[var(--color-brand-strong)]"
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
        <div className="absolute bottom-8 left-6 z-20 flex gap-2.5 md:left-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-[2px] cursor-pointer rounded-full border-0 transition-all duration-500",
                i === current
                  ? "w-8 bg-white"
                  : "w-4 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
