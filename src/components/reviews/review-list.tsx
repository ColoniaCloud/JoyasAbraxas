"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { formatReviewDate, type Review } from "@/lib/reviews";
import type { WPReviewPhoto } from "@/lib/types";
import StarRating from "./star-rating";

type Sort = "recent" | "best" | "worst";

const PAGE_SIZE = 6;

interface LightboxState {
	photos: WPReviewPhoto[];
	index: number;
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
	const [sort, setSort] = useState<Sort>("recent");
	const [onlyPhotos, setOnlyPhotos] = useState(false);
	const [visible, setVisible] = useState(PAGE_SIZE);
	const [lightbox, setLightbox] = useState<LightboxState | null>(null);

	const hasPhotos = reviews.some((r) => r.photos.length > 0);

	const shown = useMemo(() => {
		const list = onlyPhotos ? reviews.filter((r) => r.photos.length > 0) : [...reviews];
		if (sort === "best") list.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date));
		else if (sort === "worst") list.sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date));
		else list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
		return list;
	}, [reviews, sort, onlyPhotos]);

	useEffect(() => {
		if (!lightbox) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setLightbox(null);
			else if (e.key === "ArrowRight") setLightbox((l) => l && { ...l, index: (l.index + 1) % l.photos.length });
			else if (e.key === "ArrowLeft")
				setLightbox((l) => l && { ...l, index: (l.index - 1 + l.photos.length) % l.photos.length });
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [lightbox]);

	if (reviews.length === 0) return null;

	const current = lightbox ? lightbox.photos[lightbox.index] : null;

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-3">
				<label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
					Ordenar por
					<select
						value={sort}
						onChange={(e) => {
							setSort(e.target.value as Sort);
							setVisible(PAGE_SIZE);
						}}
						className="rounded-lg border border-[var(--color-line)] bg-[var(--color-background)] px-2 py-1.5 text-base text-[var(--color-ink)] sm:text-sm"
					>
						<option value="recent">Más recientes</option>
						<option value="best">Mejor valoradas</option>
						<option value="worst">Peor valoradas</option>
					</select>
				</label>
				{hasPhotos && (
					<label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-muted)]">
						<input
							type="checkbox"
							checked={onlyPhotos}
							onChange={(e) => {
								setOnlyPhotos(e.target.checked);
								setVisible(PAGE_SIZE);
							}}
							className="accent-[var(--color-brand)]"
						/>
						Solo con fotos
					</label>
				)}
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{shown.slice(0, visible).map((review) => (
					<article
						key={review.id}
						className="flex flex-col gap-2 rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel)] p-4"
					>
						<div className="flex items-center justify-between gap-2">
							<span className="font-semibold">{review.author}</span>
							<StarRating value={review.rating} size={15} />
						</div>
						<div className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--color-muted)]">
							{review.date && <time dateTime={review.date}>{formatReviewDate(review.date)}</time>}
							{review.verified && (
								<span className="rounded-full bg-[var(--color-gold-light)] px-2 py-0.5 font-medium text-[var(--color-brand-strong)]">
									Compra verificada
								</span>
							)}
						</div>
						<p className="m-0 text-sm whitespace-pre-line text-[var(--color-ink)]/90">{review.text}</p>
						{review.photos.length > 0 && (
							<ul className="m-0 mt-1 flex list-none flex-wrap gap-2 p-0">
								{review.photos.map((photo, i) => (
									<li key={photo.id}>
										<button
											type="button"
											onClick={() => setLightbox({ photos: review.photos, index: i })}
											aria-label={`Ver foto ${i + 1} de la reseña de ${review.author}`}
											className="relative block h-20 w-20 cursor-pointer overflow-hidden rounded-lg border border-[var(--color-line)]"
										>
											<Image
												src={photo.thumb}
												alt={`Foto de ${review.author}`}
												fill
												sizes="80px"
												className="object-cover"
											/>
										</button>
									</li>
								))}
							</ul>
						)}
					</article>
				))}
			</div>

			{shown.length === 0 && (
				<p className="text-sm text-[var(--color-muted)]">Todavía no hay reseñas con fotos.</p>
			)}

			{visible < shown.length && (
				<button
					type="button"
					onClick={() => setVisible((v) => v + PAGE_SIZE)}
					className="mt-4 cursor-pointer rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand)]"
				>
					Ver más reseñas
				</button>
			)}

			{lightbox && current && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="Foto de la reseña"
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
					onClick={() => setLightbox(null)}
				>
					<div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
						<Image
							src={current.url}
							alt="Foto de la reseña"
							width={current.width || 1200}
							height={current.height || 1200}
							sizes="90vw"
							className="max-h-[85vh] w-auto rounded-lg object-contain"
						/>
						<button
							type="button"
							onClick={() => setLightbox(null)}
							aria-label="Cerrar"
							className="absolute -top-3 -right-3 h-9 w-9 cursor-pointer rounded-full bg-[var(--color-panel)] text-lg leading-none"
						>
							✕
						</button>
					</div>
					{lightbox.photos.length > 1 && (
						<>
							<button
								type="button"
								aria-label="Foto anterior"
								onClick={(e) => {
									e.stopPropagation();
									setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.photos.length) % lightbox.photos.length });
								}}
								className="absolute left-3 h-10 w-10 cursor-pointer rounded-full bg-[var(--color-panel)] text-xl"
							>
								‹
							</button>
							<button
								type="button"
								aria-label="Foto siguiente"
								onClick={(e) => {
									e.stopPropagation();
									setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.photos.length });
								}}
								className="absolute right-3 h-10 w-10 cursor-pointer rounded-full bg-[var(--color-panel)] text-xl"
							>
								›
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
}
