import { formatPrice } from "@/lib/utils";

/**
 * Reglas de envío. Deben coincidir con las zonas de WooCommerce:
 * - Zona "Montevideo" (UY:UY-MO): tarifa fija $250, gratis desde $6.000.
 * - Zona "Uruguay" (resto del país): tarifa fija $350, gratis desde $6.000.
 */

/**
 * Monto mínimo de compra para envío gratis (UYU).
 * Se compara contra la suma de los precios de los productos, antes del
 * descuento por transferencia bancaria.
 */
export const FREE_SHIPPING_THRESHOLD = 6000;
export const MONTEVIDEO_SHIPPING_COST = 250;
export const INTERIOR_SHIPPING_COST = 350;

/** Textos formateados para la UI (ej. "$U 6.000"). */
export const FREE_SHIPPING_THRESHOLD_LABEL = formatPrice(FREE_SHIPPING_THRESHOLD);
export const MONTEVIDEO_SHIPPING_COST_LABEL = formatPrice(MONTEVIDEO_SHIPPING_COST);
export const INTERIOR_SHIPPING_COST_LABEL = formatPrice(INTERIOR_SHIPPING_COST);

export const MONTEVIDEO_STATE = "UY-MO";

/** Departamentos de Uruguay con el código que usa WooCommerce (`billing.state`). */
export const URUGUAY_DEPARTMENTS = [
  { code: "UY-AR", name: "Artigas" },
  { code: "UY-CA", name: "Canelones" },
  { code: "UY-CL", name: "Cerro Largo" },
  { code: "UY-CO", name: "Colonia" },
  { code: "UY-DU", name: "Durazno" },
  { code: "UY-FS", name: "Flores" },
  { code: "UY-FD", name: "Florida" },
  { code: "UY-LA", name: "Lavalleja" },
  { code: "UY-MA", name: "Maldonado" },
  { code: "UY-MO", name: "Montevideo" },
  { code: "UY-PA", name: "Paysandú" },
  { code: "UY-RN", name: "Río Negro" },
  { code: "UY-RV", name: "Rivera" },
  { code: "UY-RO", name: "Rocha" },
  { code: "UY-SA", name: "Salto" },
  { code: "UY-SJ", name: "San José" },
  { code: "UY-SO", name: "Soriano" },
  { code: "UY-TA", name: "Tacuarembó" },
  { code: "UY-TT", name: "Treinta y Tres" },
] as const;

export function isUruguayDepartment(code: string | undefined): boolean {
  return URUGUAY_DEPARTMENTS.some((d) => d.code === code);
}

export interface ShippingQuote {
  /** Costo en UYU (0 si corresponde envío gratis) */
  cost: number;
  free: boolean;
  /** Título de la línea de envío en el pedido */
  title: string;
  /** Método de WooCommerce equivalente */
  methodId: "flat_rate" | "free_shipping";
}

/**
 * Costo de envío según el subtotal de productos (sin descuento por transferencia)
 * y el departamento de destino.
 */
export function quoteShipping(productsSubtotal: number, state: string | undefined): ShippingQuote {
  if (productsSubtotal >= FREE_SHIPPING_THRESHOLD) {
    return { cost: 0, free: true, title: "Envío gratis", methodId: "free_shipping" };
  }
  return state === MONTEVIDEO_STATE
    ? { cost: MONTEVIDEO_SHIPPING_COST, free: false, title: "Envío Montevideo", methodId: "flat_rate" }
    : { cost: INTERIOR_SHIPPING_COST, free: false, title: "Envío al interior", methodId: "flat_rate" };
}
