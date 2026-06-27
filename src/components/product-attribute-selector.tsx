"use client";

import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { WPProduct, WPVariation, WCAttributeTerm } from "@/lib/types";

export interface VariationState {
  /** Atributos seleccionados (nombre + opción), en orden */
  attributes: { name: string; option: string }[];
  /** Variación resuelta a partir de la selección, o null si no hay match / incompleta */
  variation: WPVariation | null;
  /** true cuando todos los atributos de variación tienen una opción elegida */
  isComplete: boolean;
}

interface Props {
  product: WPProduct;
  variations: WPVariation[];
  colorTerms?: WCAttributeTerm[];
  acabadoTerms?: WCAttributeTerm[];
  onChange: (state: VariationState) => void;
}

/** Encuentra la variación cuyas opciones coinciden con la selección (opción "" = cualquiera). */
function matchVariation(
  variations: WPVariation[],
  selection: Record<string, string>,
): WPVariation | null {
  return (
    variations.find((v) =>
      v.attributes.every((a) => !a.option || selection[a.slug] === a.option),
    ) ?? null
  );
}

export default function ProductVariationSelector({
  product,
  variations,
  colorTerms = [],
  acabadoTerms = [],
  onChange,
}: Props) {
  const variationAttrs = useMemo(
    () =>
      product.attributes
        .filter((a) => a.variation && a.slug)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [product.attributes],
  );

  const [selection, setSelection] = useState<Record<string, string>>({});

  const update = useCallback((slug: string, option: string) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (next[slug] === option) delete next[slug];
      else next[slug] = option;
      return next;
    });
  }, []);

  const select = useCallback((slug: string, option: string) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (option) next[slug] = option;
      else delete next[slug];
      return next;
    });
  }, []);

  useEffect(() => {
    const isComplete = variationAttrs.every((a) => selection[a.slug!]);
    const variation = isComplete ? matchVariation(variations, selection) : null;
    const attributes = variationAttrs
      .filter((a) => selection[a.slug!])
      .map((a) => ({ name: a.name, option: selection[a.slug!] }));
    onChange({ attributes, variation, isComplete });
  }, [selection, variationAttrs, variations, onChange]);

  // Agrupa pa_talle-ella y pa_talle-el como un par inline (ella primero).
  // Si solo uno de los dos está presente, se trata como atributo individual.
  const renderGroups = useMemo(() => {
    type Attr = (typeof variationAttrs)[number];
    type Group = { kind: "single"; attr: Attr } | { kind: "pair"; ella: Attr; el: Attr };

    const ellaAttr = variationAttrs.find((a) => a.slug === "pa_talle-ella");
    const elAttr = variationAttrs.find((a) => a.slug === "pa_talle-el");
    const hasPair = !!(ellaAttr && elAttr);

    const groups: Group[] = [];
    let pairInserted = false;

    for (const attr of variationAttrs) {
      if (attr.slug === "pa_talle-ella" || attr.slug === "pa_talle-el") {
        if (hasPair && !pairInserted) {
          groups.push({ kind: "pair", ella: ellaAttr!, el: elAttr! });
          pairInserted = true;
        }
        // El segundo talle del par se omite (ya está incluido arriba)
      } else {
        groups.push({ kind: "single", attr });
      }
    }

    return groups;
  }, [variationAttrs]);

  return (
    <div className="mt-4 space-y-5 border-t border-[var(--color-line)] pt-4">
      {renderGroups.map((group) => {
        if (group.kind === "pair") {
          return (
            <div key="talle-pair" className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 text-sm font-semibold text-[var(--color-fg)]">{group.ella.name}</p>
                <InlineSelect
                  options={group.ella.options.filter(Boolean)}
                  selected={selection["pa_talle-ella"] ?? null}
                  onSelect={(o) => select("pa_talle-ella", o)}
                  placeholder="Seleccioná"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[var(--color-fg)]">{group.el.name}</p>
                <InlineSelect
                  options={group.el.options.filter(Boolean)}
                  selected={selection["pa_talle-el"] ?? null}
                  onSelect={(o) => select("pa_talle-el", o)}
                  placeholder="Seleccioná"
                />
              </div>
            </div>
          );
        }

        const attr = group.attr;
        const slug = attr.slug!;
        const options = attr.options.filter(Boolean);
        if (options.length === 0) return null;
        const selected = selection[slug] ?? null;
        const isColor = slug === "pa_colores" || /color/i.test(slug);
        const isAcabado = slug === "pa_acabado";
        const isInlineSelect = slug === "pa_talle-el" || slug === "pa_talle-ella" || slug === "pa_talle";
        const hasColorTerms = isColor && colorTerms.length > 0;
        const hasAcabadoTerms = isAcabado && acabadoTerms.length > 0;

        return (
          <Section key={slug} label={attr.name}>
            {isInlineSelect ? (
              <InlineSelect
                options={options}
                selected={selected}
                onSelect={(o) => select(slug, o)}
                placeholder={
                  slug === "pa_talle-el"
                    ? "Seleccioná talle de él"
                    : slug === "pa_talle-ella"
                    ? "Seleccioná talle de ella"
                    : "Seleccioná talle"
                }
              />
            ) : hasColorTerms ? (
              <ColorPicker
                options={options}
                terms={colorTerms}
                selected={selected}
                onSelect={(o) => update(slug, o)}
              />
            ) : hasAcabadoTerms ? (
              <CardPicker
                options={options}
                terms={acabadoTerms}
                selected={selected}
                onSelect={(o) => update(slug, o)}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {options.map((o) => (
                  <ToggleButton
                    key={o}
                    active={selected === o}
                    onClick={() => update(slug, o)}
                  >
                    {o}
                  </ToggleButton>
                ))}
              </div>
            )}
            {slug === "pa_talle" && (
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                ¿No sabés tu talle?{" "}
                <a href="/guia-de-talles" className="text-[var(--color-brand)] underline">
                  Ver guía de talles
                </a>
              </p>
            )}
          </Section>
        );
      })}
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[var(--color-fg)]">{label}</p>
      {children}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] min-w-[44px] cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-[#f6fffb]"
          : "border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-fg)] hover:border-[var(--color-brand)]"
      }`}
    >
      {children}
    </button>
  );
}

// Fallback de colores cuando la API no devuelve imágenes en los terms
const COLOR_HEX_FALLBACK: Record<string, string> = {
  Transparente: "#e5e7eb",
  Azul: "#3b82f6",
  Verde: "#22c55e",
  Negra: "#111827",
  Violeta: "#8b5cf6",
  Marina: "#1e3a8a",
  Amarilla: "#fbbf24",
};

function colorStyle(term?: WCAttributeTerm, name?: string): React.CSSProperties {
  if (term?.image?.src) return { backgroundImage: `url(${term.image.src})` };
  const hex = COLOR_HEX_FALLBACK[name ?? ""];
  if (hex) return { backgroundColor: hex };
  return { backgroundColor: "#d1d5db" };
}

function ColorPicker({
  options,
  terms,
  selected,
  onSelect,
}: {
  options: string[];
  terms: WCAttributeTerm[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  const byName = new Map(terms.map((t) => [t.name, t]));
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((name) => (
        <button
          key={name}
          type="button"
          title={name}
          onClick={() => onSelect(name)}
          style={colorStyle(byName.get(name), name)}
          className={`h-11 w-11 cursor-pointer rounded-full border-2 bg-cover bg-center transition-all ${
            selected === name
              ? "scale-110 border-[var(--color-brand)] shadow-md"
              : "border-transparent hover:scale-105 hover:border-[var(--color-line)]"
          }`}
        />
      ))}
    </div>
  );
}

function InlineSelect({
  options,
  selected,
  onSelect,
  placeholder,
}: {
  options: string[];
  selected: string | null;
  onSelect: (val: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={selected ?? ""}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full cursor-pointer rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2.5 text-sm font-medium text-[var(--color-fg)] transition-colors focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function CardPicker({
  options,
  terms,
  selected,
  onSelect,
}: {
  options: string[];
  terms: WCAttributeTerm[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  const byName = new Map(terms.map((t) => [t.name, t]));
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((name) => {
        const term = byName.get(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={`flex min-w-[72px] cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${
              selected === name
                ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-brand)]"
            }`}
          >
            {term?.image?.src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={term.image.src}
                alt={name}
                className="h-10 w-10 object-contain"
              />
            )}
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}
