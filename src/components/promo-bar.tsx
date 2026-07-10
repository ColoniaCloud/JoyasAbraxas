"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useHideOnScroll } from "@/lib/hooks/use-hide-on-scroll";

const MESSAGES = [
  "10% OFF pagando con transferencia bancaria",
  "Envíos gratis a todo el país en compras superiores a $3000",
  "Garantía escrita en todos nuestros productos",
];

const ROTATE_MS = 4000;
const FADE_MS = 400;

export default function PromoBar() {
  const visible = useHideOnScroll();
  const [index, setIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      const timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setFadeIn(true);
      }, FADE_MS);
      return () => clearTimeout(timeout);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-2 left-1/2 z-50 h-9 w-[calc(100%-2rem)] max-w-[1200px] -translate-x-1/2 overflow-hidden rounded-full bg-[var(--color-brand)] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "-translate-y-[calc(100%+1rem)] opacity-0"
      )}
      aria-hidden={!visible}
    >
      <p
        className={cn(
          "flex h-full items-center justify-center truncate px-6 text-center text-[11px] font-medium text-white transition-opacity ease-in-out sm:text-[12px]",
          fadeIn ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        {MESSAGES[index]}
      </p>
    </div>
  );
}
