"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WPCategory, WPProduct } from "@/lib/types";
import CategoryCarousel from "@/components/category-carousel";

interface Props {
  cat: WPCategory;
  products: WPProduct[];
  index: number;
}

export default function CategorySection({ cat, products, index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const isEven = index % 2 === 0;

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
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative w-full overflow-hidden py-14">
      {/* Background image — full bleed */}
      {cat.image ? (
        <Image
          src={cat.image.src}
          alt={cat.name}
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-panel)]" />
      )}

      {/* Side gradient — alternates dark side per section */}
      <div
        className={`absolute inset-0 ${
          isEven
            ? "bg-gradient-to-r from-black/88 via-black/55 to-black/10"
            : "bg-gradient-to-l from-black/88 via-black/55 to-black/10"
        }`}
      />
      {/* Bottom gradient — makes carousel cards legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/80" />

      {/* Content — constrained to global max-width */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-6">

        {/* Header text */}
        <div className={`mb-8 ${isEven ? "text-left" : "text-right"}`}>
          <p
            className="mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/50 transition-all duration-700"
            style={{
              transitionDelay: "60ms",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Colección
          </p>

          <h2
            className="m-0 mb-5 font-light leading-none tracking-tight text-white transition-all duration-700"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              transitionDelay: "160ms",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            {cat.name}
          </h2>

          {cat.description && (
            <p
              className="mb-5 text-[14px] leading-relaxed text-white/60 transition-all duration-700"
              style={{
                maxWidth: "420px",
                marginLeft: isEven ? 0 : "auto",
                transitionDelay: "250ms",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(14px)",
              }}
            >
              {cat.description}
            </p>
          )}

          <Link
            href={`/categorias/${cat.slug}`}
            className="inline-flex items-center gap-2 border-b border-white/30 pb-0.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:border-white hover:gap-3"
            style={{
              transitionDelay: "330ms",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 700ms ease, transform 700ms ease, gap 300ms ease, border-color 300ms ease",
            }}
          >
            Ver colección →
          </Link>
        </div>

        {/* Carousel — inside the same full-bleed section */}
        <div
          className="transition-all duration-700"
          style={{
            transitionDelay: "420ms",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
          }}
        >
          <CategoryCarousel products={products} index={index} />
        </div>
      </div>
    </section>
  );
}
