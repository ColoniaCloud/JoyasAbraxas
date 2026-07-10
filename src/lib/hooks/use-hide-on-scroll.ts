"use client";

import { useEffect, useRef, useState } from "react";

/**
 * true cerca del tope de la página o mientras se scrollea hacia arriba;
 * false apenas se scrollea hacia abajo más allá del umbral.
 */
export function useHideOnScroll(threshold = 12) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const diff = y - lastY.current;
      if (y <= threshold) setVisible(true);
      else if (diff > 4) setVisible(false);
      else if (diff < -4) setVisible(true);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}
