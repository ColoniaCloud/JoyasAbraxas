import type { CartItem, ProductCustomization } from "./types";

/** Clave única de línea de carrito: distingue variaciones del mismo producto. */
export function lineKey(productId: number, variationId?: number): string {
	return `${productId}:${variationId ?? 0}`;
}

/** Precio unitario real de una línea: el de la variación si existe, si no el del producto. */
export function unitPrice(item: CartItem): number {
	const raw = item.customization?.variationPrice ?? item.product.price;
	return parseFloat(raw || "0");
}

/** Aplana la personalización a pares label/value para mostrar en carrito/checkout. */
export function customizationSummary(
	c?: ProductCustomization,
): { label: string; value: string }[] {
	if (!c) return [];
	const out: { label: string; value: string }[] = [];
	for (const a of c.variationAttributes ?? []) {
		out.push({ label: a.name, value: a.option });
	}
	for (const p of c.personalization ?? []) {
		out.push({ label: p.label, value: p.value });
	}
	if (c.note) {
		out.push({ label: "Notas", value: c.note });
	}
	return out;
}
