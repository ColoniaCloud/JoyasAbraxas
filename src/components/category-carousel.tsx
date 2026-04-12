"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WPProduct } from "@/lib/types";

interface CategoryCarouselProps {
  products: WPProduct[];
  index?: number;
}

export default function CategoryCarousel({ products, index = 0 }: CategoryCarouselProps) {
  const [paused, setPaused] = useState(false);

  if (!products.length) {
    return <p className="text-sm text-[var(--color-muted)]">Sin productos disponibles.</p>;
  }

  // Alternating direction: even → left, odd → right
  const animationName = index % 2 === 0 ? "auto-scroll-left" : "auto-scroll-right";
  const duration = `${Math.max(products.length * 6, 40)}s`;

  // Duplicate list for seamless infinite loop
  const looped = [...products, ...products];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `${animationName} ${duration} linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {looped.map((product, i) => (
          <Link
            key={`${product.id}-${i}`}
            href={`/productos/${product.slug}`}
            className="group flex w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <div className="relative h-[200px] w-full overflow-hidden bg-[#1c1a18]">
              {product.images[0] ? (
                <Image
                  src={product.images[0].src}
                  alt={product.images[0].alt || product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="220px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-[var(--color-muted)]">
                  {product.name.charAt(0)}
                </div>
              )}
              {product.sale_price && product.sale_price !== product.regular_price && (
                <span className="absolute top-2 left-2 rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Oferta
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="mb-1 line-clamp-2 text-[13px] font-medium leading-snug text-[var(--color-ink)]">
                {product.name}
              </p>
              <div className="mt-auto flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[var(--color-brand-strong)]">
                  {product.price ? `$${product.price}` : "—"}
                </span>
                {product.sale_price && product.sale_price !== product.regular_price && (
                  <span className="text-xs text-[var(--color-muted)] line-through">
                    ${product.regular_price}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
