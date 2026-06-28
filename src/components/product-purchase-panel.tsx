"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
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

function cleanGrabadoValue(val: string): string {
  // Solo letras (incl. acentos/ñ), números, espacios, ♥ y ∞
  const cleaned = val.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s♥∞]/g, "");
  return cleaned.slice(0, 12);
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
  const [grabado, setGrabado] = useState("");
  const [grabadoEl, setGrabadoEl] = useState("");
  const [grabadoElla, setGrabadoElla] = useState("");
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const isAlianzas = useMemo(() => {
    return product.categories?.some(
      (cat) =>
        cat.slug === "alianzas" ||
        cat.name.toLowerCase() === "alianzas",
    ) ?? false;
  }, [product.categories]);

  const isEsclavas = useMemo(() => {
    return product.categories?.some(
      (cat) =>
        cat.slug === "esclavas" ||
        cat.name.toLowerCase() === "esclavas",
    ) ?? false;
  }, [product.categories]);

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

    if (isEsclavas && grabado.trim()) {
      personalization.push({ label: "Grabado", value: grabado.trim() });
    }

    if (isAlianzas) {
      if (grabadoEl.trim()) {
        personalization.push({ label: "Grabado Él", value: grabadoEl.trim() });
      }
      if (grabadoElla.trim()) {
        personalization.push({ label: "Grabado Ella", value: grabadoElla.trim() });
      }
    }

    if (personalization.length) customization.personalization = personalization;

    const trimmedNote = note.trim();
    if (trimmedNote) customization.note = trimmedNote;

    addItem(
      product,
      1,
      Object.keys(customization).length ? customization : undefined,
    );
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: resolvedPrice ? parseFloat(resolvedPrice) : undefined,
      quantity: 1,
    });
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

      {isEsclavas && (
        <div className="space-y-1.5 border-t border-[var(--color-line)] pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[var(--color-fg)]">Grabado personalizado</span>
            <span className="text-xs text-[var(--color-muted)]">{grabado.length}/12 caracteres</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={grabado}
              onChange={(e) => setGrabado(cleanGrabadoValue(e.target.value))}
              placeholder="Grabado (máx. 12 caracteres)"
              className="w-full rounded-[9px] border border-[var(--color-line)] bg-[var(--color-bg)] py-2.5 pl-3 pr-20 font-[inherit] font-normal text-base sm:text-sm text-[var(--color-fg)] focus:border-[var(--color-brand)] focus:outline-none"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (grabado.length < 12) {
                    setGrabado(cleanGrabadoValue(grabado + "♥"));
                  }
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--color-panel)] text-sm text-[var(--color-brand)] border border-[var(--color-line)] hover:border-[var(--color-brand)] transition-colors"
                title="Insertar corazón"
              >
                ♥
              </button>
              <button
                type="button"
                onClick={() => {
                  if (grabado.length < 12) {
                    setGrabado(cleanGrabadoValue(grabado + "∞"));
                  }
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--color-panel)] text-sm text-[var(--color-fg)] border border-[var(--color-line)] hover:border-[var(--color-brand)] transition-colors"
                title="Insertar infinito"
              >
                ∞
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-muted)]">
            Solo letras, números y los símbolos ♥ u ∞. Opcional.
          </p>
        </div>
      )}

      {isAlianzas && (
        <div className="border-t border-[var(--color-line)] pt-4">
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="w-full rounded-[9px] border border-[var(--color-brand)] bg-transparent py-2.5 text-sm font-semibold text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-[#f6fffb] transition-all cursor-pointer"
          >
            AGREGAR GRABADO GRATIS
          </button>
          {(grabadoEl.trim() || grabadoElla.trim()) && (
            <div className="mt-2 rounded-lg bg-[var(--color-panel)] border border-[var(--color-line)] p-2.5 text-xs text-[var(--color-fg)]">
              <p className="font-semibold mb-1 text-[var(--color-brand)]">Grabado configurado:</p>
              {grabadoEl.trim() && <p>• Él: <span className="font-medium italic">"{grabadoEl}"</span></p>}
              {grabadoElla.trim() && <p>• Ella: <span className="font-medium italic">"{grabadoElla}"</span></p>}
            </div>
          )}
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
            {resolvedPrice ? formatPrice(resolvedPrice) : "—"}
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

    {/* Modal de Grabado para Alianzas */}
    <dialog
      ref={dialogRef}
      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm max-w-md w-[90%] focus:outline-none text-[var(--color-ink)]"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        margin: 0,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--color-ink)]">Grabado de Alianzas</h3>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer text-xl font-bold border-0 bg-transparent"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Grabado Él */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Grabado Él</span>
              <span className="text-xs text-[var(--color-ink)] opacity-60">{grabadoEl.length}/12</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={grabadoEl}
                onChange={(e) => setGrabadoEl(cleanGrabadoValue(e.target.value))}
                placeholder="Grabado Él (opcional)"
                className="w-full rounded-[9px] border border-[var(--color-line)] bg-[var(--color-bg)] py-2.5 pl-3 pr-20 font-[inherit] font-normal text-base sm:text-sm text-[var(--color-ink)] focus:border-[var(--color-brand)] focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (grabadoEl.length < 12) {
                      setGrabadoEl(cleanGrabadoValue(grabadoEl + "♥"));
                    }
                  }}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--color-panel)] text-sm text-[var(--color-brand)] border border-[var(--color-line)] hover:border-[var(--color-brand)] transition-colors"
                >
                  ♥
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (grabadoEl.length < 12) {
                      setGrabadoEl(cleanGrabadoValue(grabadoEl + "∞"));
                    }
                  }}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--color-panel)] text-sm text-[var(--color-fg)] border border-[var(--color-line)] hover:border-[var(--color-brand)] transition-colors"
                >
                  ∞
                </button>
              </div>
            </div>
          </div>

          {/* Grabado Ella */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Grabado Ella</span>
              <span className="text-xs text-[var(--color-ink)] opacity-60">{grabadoElla.length}/12</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={grabadoElla}
                onChange={(e) => setGrabadoElla(cleanGrabadoValue(e.target.value))}
                placeholder="Grabado Ella (opcional)"
                className="w-full rounded-[9px] border border-[var(--color-line)] bg-[var(--color-bg)] py-2.5 pl-3 pr-20 font-[inherit] font-normal text-base sm:text-sm text-[var(--color-ink)] focus:border-[var(--color-brand)] focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (grabadoElla.length < 12) {
                      setGrabadoElla(cleanGrabadoValue(grabadoElla + "♥"));
                    }
                  }}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--color-panel)] text-sm text-[var(--color-brand)] border border-[var(--color-line)] hover:border-[var(--color-brand)] transition-colors"
                >
                  ♥
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (grabadoElla.length < 12) {
                      setGrabadoElla(cleanGrabadoValue(grabadoElla + "∞"));
                    }
                  }}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--color-panel)] text-sm text-[var(--color-fg)] border border-[var(--color-line)] hover:border-[var(--color-brand)] transition-colors"
                >
                  ∞
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[var(--color-ink)] opacity-70 leading-relaxed">
          Cada grabado permite hasta 12 caracteres (solo letras, números y los símbolos ♥ u ∞).
        </p>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="w-full rounded-[9px] border-0 bg-[var(--color-brand)] p-3 font-[inherit] font-bold text-[#f6fffb] transition-colors cursor-pointer hover:bg-[var(--color-brand-strong)] text-sm"
        >
          Listo
        </button>
      </div>
    </dialog>
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
        {price && <span className="text-sm font-bold">{formatPrice(price)}</span>}
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
