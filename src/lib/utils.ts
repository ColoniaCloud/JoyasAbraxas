import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio en pesos uruguayos con separadores es-UY y prefijo "$U"
 * para evitar la ambigüedad de "$" (pesos vs dólares).
 * Ej.: formatPrice("1500") -> "$U 1.500"
 */
export function formatPrice(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value
  if (n == null || Number.isNaN(n)) return "—"
  const formatted = new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
  return `$U ${formatted}`
}
