import PromoBannerContent from "./promo-banner-content";

/** Banner inline (mismo diseño que el modal de promociones) para incrustar en páginas como carrito y checkout. */
export default function PromoBanner() {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--color-line)] shadow-lg">
      <PromoBannerContent />
    </div>
  );
}
