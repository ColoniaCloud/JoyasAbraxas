import sanitizeHtml from "sanitize-html";
import type { WPReview, WPReviewPhoto } from "./types";

/** Límites compartidos por el formulario (cliente) y la ruta /api/reviews (servidor). */
export const REVIEW_LIMITS = {
	maxPhotos: 3,
	/** Tope por foto ya comprimida en el navegador. */
	maxPhotoBytes: 6 * 1024 * 1024,
	nameMin: 2,
	nameMax: 60,
	textMin: 10,
	textMax: 2000,
} as const;

export const REVIEW_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Reseña lista para pintar. No incluye el email del cliente: este objeto viaja al navegador. */
export interface Review {
	id: number;
	author: string;
	text: string;
	rating: number;
	/** AAAA-MM-DD */
	date: string;
	verified: boolean;
	photos: WPReviewPhoto[];
}

export interface ReviewSummary {
	count: number;
	average: number;
	distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const NAMED_ENTITIES: Record<string, string> = {
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
	"&#x27;": "'",
	"&nbsp;": " ",
};

function decodeEntities(text: string): string {
	return text
		.replace(/&(?:lt|gt|quot|nbsp|#39|#x27);/g, (m) => NAMED_ENTITIES[m] ?? m)
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&amp;/g, "&");
}

/** WooCommerce devuelve el texto como HTML (<p>, <br>): se convierte a texto plano. */
export function htmlToText(html: string): string {
	const withBreaks = html
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
	const stripped = sanitizeHtml(withBreaks, { allowedTags: [], allowedAttributes: {} });
	return decodeEntities(stripped).trim();
}

export function toReview(raw: WPReview): Review {
	return {
		id: raw.id,
		author: decodeEntities(raw.reviewer || "Cliente").trim() || "Cliente",
		text: htmlToText(raw.review ?? ""),
		rating: Math.max(1, Math.min(5, Math.round(Number(raw.rating) || 0))),
		date: (raw.date_created ?? "").slice(0, 10),
		verified: Boolean(raw.verified),
		photos: (raw.photos ?? []).filter((p) => p.url?.startsWith("https://")),
	};
}

export function summarizeReviews(reviews: Pick<Review, "rating">[]): ReviewSummary {
	const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribution"];
	let sum = 0;
	for (const { rating } of reviews) {
		distribution[rating as 1 | 2 | 3 | 4 | 5] += 1;
		sum += rating;
	}
	const count = reviews.length;
	return { count, average: count ? sum / count : 0, distribution };
}

/** "2025-11-20" → "20 de noviembre de 2025" (sin depender de la zona horaria). */
export function formatReviewDate(date: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
	return new Date(`${date}T12:00:00Z`).toLocaleDateString("es-UY", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}
