"use client";

import { useCallback, useMemo, useState } from "react";
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
  const [added, setAdded] = useState(false);

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

    addItem(
      product,
      1,
      Object.keys(customization).length ? customization : undefined,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
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
                className="rounded-[9px] border border-[var(--color-line)] bg-[var(--color-bg)] p-2.5 font-[inherit] font-normal"
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

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAdd}
        className={`w-full rounded-[9px] border-0 p-3 font-[inherit] font-bold text-[#f6fffb] transition-colors ${
          added
            ? "cursor-default bg-green-600"
            : !canAdd
            ? "cursor-not-allowed bg-[var(--color-muted)] opacity-60"
            : "cursor-pointer bg-[var(--color-brand)] hover:bg-[var(--color-brand-strong)]"
        }`}
      >
        {added
          ? "¡Agregado al carrito!"
          : noVariations
          ? "No disponible"
          : !variationOk
          ? "Completá tu selección"
          : !persOk
          ? "Completá los datos"
          : "Agregar al carrito"}
      </button>
    </div>
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
