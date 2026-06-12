"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import type {
  ProductCustomization,
  WPProduct,
  WPVariation,
  WCAttributeTerm,
} from "@/lib/types";
import ProductVariationSelector, {
  type VariationState,
} from "@/components/product-attribute-selector";

interface Props {
  product: WPProduct;
  variations: WPVariation[];
  colorTerms?: WCAttributeTerm[];
  acabadoTerms?: WCAttributeTerm[];
}

interface PersField {
  etiqueta: string;
  requerido?: boolean;
}

/**
 * Campos personalizables del producto, leídos desde ACF si el backend los expone
 * bajo `acf.personalizacion` como un array de `{ etiqueta, requerido }`.
 * Mientras ACF no esté expuesto en REST, devuelve [] y no se renderiza nada.
 */
function getPersonalizationFields(product: WPProduct): PersField[] {
  const raw = product.acf?.["personalizacion"];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => (r && typeof r === "object" ? (r as Record<string, unknown>) : null))
    .map((r) =>
      r
        ? {
            etiqueta: String(r.etiqueta ?? r.label ?? ""),
            requerido: Boolean(r.requerido ?? r.required),
          }
        : { etiqueta: "" },
    )
    .filter((f) => f.etiqueta);
}

export default function ProductPurchasePanel({
  product,
  variations,
  colorTerms = [],
  acabadoTerms = [],
}: Props) {
  const { addItem } = useCart();
  const isVariable = product.type === "variable";
  const persFields = useMemo(() => getPersonalizationFields(product), [product]);

  const [variation, setVariation] = useState<VariationState | null>(null);
  const [persInputs, setPersInputs] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  // Barra sticky móvil: visible solo cuando el botón inline sale de pantalla
  const inlineBtnRef = useRef<HTMLButtonElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = inlineBtnRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleVariationChange = useCallback((state: VariationState) => {
    setVariation(state);
  }, []);

  const noVariations = isVariable && variations.length === 0;

  // Validación de variación: completa, con match y con precio válido
  const matched = variation?.variation ?? null;
  const variationOk =
    !isVariable ||
    (variation?.isComplete === true && matched !== null && !!matched.price);

  const persOk = persFields.every(
    (f) => !f.requerido || (persInputs[f.etiqueta] ?? "").trim().length > 0,
  );

  const canAdd = variationOk && persOk && !noVariations;

  const resolvedPrice = matched?.price || product.price;

  const buttonLabel = added
    ? "¡Agregado al carrito!"
    : noVariations
    ? "No disponible"
    : !variationOk
    ? "Completá tu selección"
    : !persOk
    ? "Completá los datos"
    : "Agregar al carrito";

  const buttonStateClass = added
    ? "cursor-default bg-green-600"
    : !canAdd
    ? "cursor-not-allowed bg-[var(--color-muted)] opacity-60"
    : "cursor-pointer bg-[var(--color-brand)] hover:bg-[var(--color-brand-strong)]";

  const handleAddToCart = () => {
    if (!canAdd) return;

    const customization: ProductCustomization = {};
    if (matched) {
      customization.variationId = matched.id;
      customization.variationPrice = matched.price;
      customization.variationAttributes = variation?.attributes ?? [];
    }
    const personalization = persFields
      .map((f) => ({ label: f.etiqueta, value: (persInputs[f.etiqueta] ?? "").trim() }))
      .filter((p) => p.value);
    if (personalization.length) customization.personalization = personalization;

    const trimmedNote = note.trim();
    if (trimmedNote) customization.note = trimmedNote;

    addItem(
      product,
      1,
      Object.keys(customization).length ? customization : undefined,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
    <div className="space-y-4">
      {isVariable && !noVariations && (
        <ProductVariationSelector
          product={product}
          variations={variations}
          colorTerms={colorTerms}
          acabadoTerms={acabadoTerms}
          onChange={handleVariationChange}
        />
      )}

      {persFields.length > 0 && (
        <div className="space-y-3 border-t border-[var(--color-line)] pt-4">
          {persFields.map((f) => (
            <label key={f.etiqueta} className="grid gap-1.5 text-sm font-semibold">
              {f.etiqueta}
              {f.requerido && <span className="text-[var(--color-brand)]"> *</span>}
              <input
                type="text"
                value={persInputs[f.etiqueta] ?? ""}
                onChange={(e) =>
                  setPersInputs((p) => ({ ...p, [f.etiqueta]: e.target.value }))
                }
                className="rounded-[9px] border border-[var(--color-line)] bg-[var(--color-bg)] p-2.5 font-[inherit] font-normal text-base sm:text-sm"
              />
            </label>
          ))}
        </div>
      )}

      {isVariable && variation?.isComplete && matched && (
        <SelectionSummary attributes={variation.attributes} price={matched.price} />
      )}

      {isVariable && variation?.isComplete && (!matched || !matched.price) && (
        <p className="rounded-lg border border-amber-900/40 bg-amber-950/30 p-2.5 text-sm text-amber-400">
          Esa combinación no está disponible. Probá otra opción o consultanos.
        </p>
      )}

      {noVariations && (
        <p className="rounded-lg border border-amber-900/40 bg-amber-950/30 p-2.5 text-sm text-amber-400">
          Este producto aún no tiene variantes cargadas. Consultanos para comprarlo.
        </p>
      )}

      <label className="grid gap-1.5 text-sm font-semibold">
        Notas
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agregá una nota para tu pedido (opcional)"
          className="rounded-[9px] border border-[var(--color-line)] bg-[var(--color-bg)] p-2.5 font-[inherit] font-normal text-base sm:text-sm"
        />
      </label>

      <button
        ref={inlineBtnRef}
        type="button"
        onClick={handleAddToCart}
        disabled={!canAdd}
        className={`w-full rounded-[9px] border-0 p-3 font-[inherit] font-bold text-[#f6fffb] transition-colors ${buttonStateClass}`}
      >
        {buttonLabel}
      </button>
    </div>

    {/* Barra de compra fija en móvil — aparece al perder de vista el botón inline */}
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-panel)]/95 backdrop-blur-xl transition-transform duration-300 lg:hidden ${
        showSticky ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[1080px] items-center gap-3 px-4 py-3">
        <div className="shrink-0 leading-tight">
          <p className="m-0 text-[11px] text-[var(--color-muted)]">
            {isVariable && !matched ? "Desde" : "Precio"}
          </p>
          <p className="m-0 text-lg font-bold">
            {resolvedPrice ? `$${resolvedPrice}` : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className={`flex-1 rounded-[9px] border-0 p-3 font-[inherit] font-bold text-[#f6fffb] transition-colors ${buttonStateClass}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
    </>
  );
}

function SelectionSummary({
  attributes,
  price,
}: {
  attributes: { name: string; option: string }[];
  price: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Tu selección
        </p>
        {price && <span className="text-sm font-bold">${price}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {attributes.map(({ name, option }) => (
          <span
            key={name}
            className="rounded-full border border-[var(--color-brand)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand)]"
          >
            {name}: {option}
          </span>
        ))}
      </div>
    </div>
  );
}
