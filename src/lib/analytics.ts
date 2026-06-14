/**
 * Eventos de e-commerce para GA4 (gtag) + Meta Pixel (fbq).
 * Solo se invocan desde componentes cliente (event handlers / effects).
 * Si gtag/fbq no están cargados (env sin IDs), no pasa nada (optional chaining).
 * Tipos de window.gtag/window.fbq declarados en components/analytics.tsx.
 */

const CURRENCY = "UYU";

export interface AnalyticsItem {
  id: number | string;
  name: string;
  price?: number;
  quantity?: number;
}

function gaItems(items: AnalyticsItem[]) {
  return items.map((i) => ({
    item_id: String(i.id),
    item_name: i.name,
    price: i.price,
    quantity: i.quantity ?? 1,
  }));
}

function fbContents(items: AnalyticsItem[]) {
  return items.map((i) => ({ id: String(i.id), quantity: i.quantity ?? 1 }));
}

function numItems(items: AnalyticsItem[]) {
  return items.reduce((n, i) => n + (i.quantity ?? 1), 0);
}

export function trackAddToCart(item: AnalyticsItem) {
  const value = (item.price ?? 0) * (item.quantity ?? 1);
  window.gtag?.("event", "add_to_cart", {
    currency: CURRENCY,
    value,
    items: gaItems([item]),
  });
  window.fbq?.("track", "AddToCart", {
    content_type: "product",
    content_ids: [String(item.id)],
    content_name: item.name,
    contents: fbContents([item]),
    value,
    currency: CURRENCY,
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number) {
  window.gtag?.("event", "begin_checkout", {
    currency: CURRENCY,
    value,
    items: gaItems(items),
  });
  window.fbq?.("track", "InitiateCheckout", {
    content_type: "product",
    content_ids: items.map((i) => String(i.id)),
    contents: fbContents(items),
    num_items: numItems(items),
    value,
    currency: CURRENCY,
  });
}

export function trackPurchase(opts: {
  orderId: string | number;
  value: number;
  items: AnalyticsItem[];
}) {
  window.gtag?.("event", "purchase", {
    transaction_id: String(opts.orderId),
    currency: CURRENCY,
    value: opts.value,
    items: gaItems(opts.items),
  });
  window.fbq?.("track", "Purchase", {
    content_type: "product",
    content_ids: opts.items.map((i) => String(i.id)),
    contents: fbContents(opts.items),
    num_items: numItems(opts.items),
    value: opts.value,
    currency: CURRENCY,
  });
}
