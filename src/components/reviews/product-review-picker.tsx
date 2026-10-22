"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReviewForm from "./review-form";

export interface ReviewableProduct {
	id: number;
	name: string;
	slug: string;
	image: string | null;
}

const MAX_RESULTS = 8;

/** Minúsculas y sin tildes: «mobius» encuentra «Möbius». */
function normalize(text: string): string {
	return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function Thumb({ product, size }: { product: ReviewableProduct; size: number }) {
	return (
		<span
			className="relative shrink-0 overflow-hidden rounded-lg bg-[#1c1a18]"
			style={{ width: size, height: size }}
		>
			{product.image && (
				<Image src={product.image} alt="" fill sizes={`${size}px`} className="object-cover" />
			)}
		</span>
	);
}

interface ProductReviewPickerProps {
	products: ReviewableProduct[];
	initialSlug?: string;
}

export default function ProductReviewPicker({ products, initialSlug }: ProductReviewPickerProps) {
	const [selected, setSelected] = useState<ReviewableProduct | null>(
		() => products.find((p) => p.slug === initialSlug) ?? null,
	);
	const [searching, setSearching] = useState(false);
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const index = useMemo(() => products.map((p) => ({ product: p, key: normalize(p.name) })), [products]);

	const results = useMemo(() => {
		const tokens = normalize(query).split(/\s+/).filter(Boolean);
		if (!tokens.length) return [];
		return index
			.filter(({ key }) => tokens.every((t) => key.includes(t)))
			.slice(0, MAX_RESULTS)
			.map(({ product }) => product);
	}, [index, query]);

	function choose(product: ReviewableProduct) {
		setSelected(product);
		setSearching(false);
		setQuery("");
	}

	const showSearch = !selected || searching;
	const hasQuery = query.trim().length > 0;

	return (
		<div className="flex flex-col gap-8">
			<section aria-labelledby="paso-producto">
				<h2 id="paso-producto" className="mt-0 mb-3 text-lg">
					1. Elegí el producto
				</h2>

				{showSearch ? (
					<div>
						<label htmlFor="buscar-producto" className="sr-only">
							Buscar producto
						</label>
						<div className="flex gap-2">
							<input
								id="buscar-producto"
								ref={inputRef}
								type="search"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Buscá por nombre (por ejemplo, Alianzas Möbius)"
								autoComplete="off"
								autoFocus={searching}
								aria-controls="resultados-producto"
								className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-background)] px-3 py-2.5 text-base text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand)] sm:text-sm"
							/>
							{selected && (
								<button
									type="button"
									onClick={() => {
										setSearching(false);
										setQuery("");
									}}
									className="shrink-0 cursor-pointer rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold"
								>
									Cancelar
								</button>
							)}
						</div>

						<ul
							id="resultados-producto"
							aria-live="polite"
							className="m-0 mt-2 flex list-none flex-col gap-1 p-0"
						>
							{results.map((product) => (
								<li key={product.id}>
									<button
										type="button"
										onClick={() => choose(product)}
										className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 text-left transition-colors hover:border-[var(--color-brand)]"
									>
										<Thumb product={product} size={48} />
										<span className="text-sm font-medium">{product.name}</span>
									</button>
								</li>
							))}
							{hasQuery && results.length === 0 && (
								<li className="text-sm text-[var(--color-muted)]">
									No encontramos ese producto. Probá con otra palabra o mirá el{" "}
									<Link href="/productos" className="underline hover:text-[var(--color-ink)]">
										catálogo
									</Link>
									.
								</li>
							)}
						</ul>
					</div>
				) : (
					<div className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
						<Thumb product={selected} size={64} />
						<div className="min-w-0 flex-1">
							<p className="m-0 truncate font-semibold">{selected.name}</p>
							<Link
								href={`/productos/${selected.slug}`}
								className="text-xs text-[var(--color-muted)] underline hover:text-[var(--color-ink)]"
							>
								Ver producto
							</Link>
						</div>
						<button
							type="button"
							onClick={() => {
								setSearching(true);
								requestAnimationFrame(() => inputRef.current?.focus());
							}}
							className="shrink-0 cursor-pointer rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand)]"
						>
							Cambiar
						</button>
					</div>
				)}
			</section>

			{selected && (
				<section aria-labelledby="paso-resena">
					<h2 id="paso-resena" className="mt-0 mb-3 text-lg">
						2. Contanos tu experiencia
					</h2>
					<ReviewForm
						productId={selected.id}
						productName={selected.name}
						standalone
						successAction={
							<button
								type="button"
								onClick={() => {
									setSelected(null);
									setSearching(false);
									setQuery("");
								}}
								className="cursor-pointer rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand)]"
							>
								Reseñar otro producto
							</button>
						}
					/>
				</section>
			)}
		</div>
	);
}
