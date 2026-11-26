import type { WPProduct, WPPost } from "./types";
import { summarizeReviews, type Review } from "./reviews";
import {
	FREE_SHIPPING_THRESHOLD,
	FREE_SHIPPING_THRESHOLD_LABEL,
	INTERIOR_SHIPPING_COST,
	INTERIOR_SHIPPING_COST_LABEL,
	MONTEVIDEO_SHIPPING_COST,
	MONTEVIDEO_SHIPPING_COST_LABEL,
	MONTEVIDEO_STATE,
	URUGUAY_DEPARTMENTS,
	quoteShipping,
} from "./shipping";

const SITE_NAME = "Abraxas Joyería";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.joyasabraxas.com";
// Logo real (WordPress) para el rich result de Organization. El antiguo
// `${SITE_URL}/branding/logo.png` no existía y dejaba el schema inválido.
const LOGO_URL =
	"https://api.joyasabraxas.com/wp-content/uploads/2023/09/cropped-logo_n.png";

export function organizationJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "JewelryStore",
		name: SITE_NAME,
		url: SITE_URL,
		logo: LOGO_URL,
		address: {
			"@type": "PostalAddress",
			addressLocality: "Montevideo",
			addressCountry: "UY",
		},
		contactPoint: {
			"@type": "ContactPoint",
			telephone: "+598-98-842-100",
			contactType: "customer service",
		},
		sameAs: [
			"https://www.instagram.com/joyas.abraxas",
			"https://www.facebook.com/people/Abraxas-Joyas/100063966942309/",
		],
		hasShippingService: storeShippingServiceJsonLd(),
	};
}

const toIsoRegion = (code: string) => code.replace(/^UY-/, "");
const INTERIOR_REGIONS = URUGUAY_DEPARTMENTS.filter((d) => d.code !== MONTEVIDEO_STATE).map((d) =>
	toIsoRegion(d.code),
);

function shippingCondition(
	regions: string | string[],
	orderValue: { minValue: number; maxValue?: number },
	rate: number,
	transitDays: { min: number; max: number },
) {
	return {
		"@type": "ShippingConditions",
		shippingDestination: { "@type": "DefinedRegion", addressCountry: "UY", addressRegion: regions },
		orderValue: { "@type": "MonetaryAmount", currency: "UYU", ...orderValue },
		shippingRate: { "@type": "MonetaryAmount", value: rate, currency: "UYU" },
		transitTime: {
			"@type": "ServicePeriod",
			duration: { "@type": "QuantitativeValue", minValue: transitDays.min, maxValue: transitDays.max, unitCode: "DAY" },
		},
	};
}

/**
 * Política de envíos de la tienda (Organization > hasShippingService), con las
 * mismas reglas que el checkout y WooCommerce (src/lib/shipping.ts):
 * Montevideo $250 en hasta 24 h, interior $350 por DAC en hasta 48 h,
 * gratis desde $6.000 de compra.
 */
function storeShippingServiceJsonLd() {
	const paid = { minValue: 0, maxValue: FREE_SHIPPING_THRESHOLD - 0.01 };
	const free = { minValue: FREE_SHIPPING_THRESHOLD };
	const montevideo = toIsoRegion(MONTEVIDEO_STATE);
	const sameDay = { min: 0, max: 1 };
	const twoDays = { min: 1, max: 2 };
	return {
		"@type": "ShippingService",
		name: "Envíos a todo Uruguay",
		description: `Montevideo ${MONTEVIDEO_SHIPPING_COST_LABEL} (hasta 24 h), interior ${INTERIOR_SHIPPING_COST_LABEL} por DAC (hasta 48 h). Gratis en compras desde ${FREE_SHIPPING_THRESHOLD_LABEL}.`,
		fulfillmentType: "https://schema.org/FulfillmentTypeDelivery",
		shippingConditions: [
			shippingCondition(montevideo, paid, MONTEVIDEO_SHIPPING_COST, sameDay),
			shippingCondition(montevideo, free, 0, sameDay),
			shippingCondition(INTERIOR_REGIONS, paid, INTERIOR_SHIPPING_COST, twoDays),
			shippingCondition(INTERIOR_REGIONS, free, 0, twoDays),
		],
	};
}

function shippingDetail(rate: number, region: Record<string, unknown>) {
	return {
		"@type": "OfferShippingDetails",
		shippingRate: { "@type": "MonetaryAmount", value: rate, currency: "UYU" },
		shippingDestination: { "@type": "DefinedRegion", addressCountry: "UY", ...region },
	};
}

/**
 * Costo de envío de una unidad del producto, con las mismas reglas que el checkout
 * (`quoteShipping`). Google espera `addressRegion` en ISO 3166-2 sin el prefijo del
 * país ("MO"), por eso se recorta el código de WooCommerce ("UY-MO").
 */
function shippingDetailsJsonLd(unitPrice: number) {
	if (quoteShipping(unitPrice, MONTEVIDEO_STATE).free) {
		return shippingDetail(0, {});
	}
	const toIso = (code: string) => code.replace(/^UY-/, "");
	const interior = URUGUAY_DEPARTMENTS.filter((d) => d.code !== MONTEVIDEO_STATE).map((d) => toIso(d.code));
	return [
		shippingDetail(quoteShipping(unitPrice, MONTEVIDEO_STATE).cost, { addressRegion: toIso(MONTEVIDEO_STATE) }),
		shippingDetail(quoteShipping(unitPrice, "").cost, { addressRegion: interior }),
	];
}

/**
 * `reviews` son las reseñas aprobadas reales. El aggregateRating sale de ellas y no
 * de `product.rating_count`: ese contador es una caché de WooCommerce que puede
 * quedar desactualizada (valoraciones sin reseña detrás), y Google lo penaliza.
 */
export function productJsonLd(product: WPProduct, reviews: Review[] = []) {
	const summary = summarizeReviews(reviews);
	const offers: Record<string, unknown> = {
		"@type": "Offer",
		priceCurrency: "UYU",
		price: product.price,
		priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
		availability:
			product.stock_status === "instock"
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock",
		url: `${SITE_URL}/productos/${product.slug}`,
		shippingDetails: shippingDetailsJsonLd(parseFloat(product.price || "0")),
		hasMerchantReturnPolicy: {
			"@type": "MerchantReturnPolicy",
			applicableCountry: "UY",
			returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnPeriod",
			merchantReturnDays: 30,
			returnMethod: "https://schema.org/ReturnByMail",
			// Política de /envios-y-devoluciones: solo cambios (no reintegro) y el envío
			// del cambio lo paga el cliente, salvo fallas de fabricación.
			returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
			refundType: "https://schema.org/ExchangeRefund",
		},
	};

	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		description: product.short_description?.replace(/<[^>]+>/g, "").slice(0, 300),
		image: product.images.map((img) => img.src),
		sku: product.sku || undefined,
		mpn: product.sku || String(product.id),
		brand: {
			"@type": "Brand",
			name: "Abraxas",
		},
		offers,
		...(summary.count > 0 && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: summary.average.toFixed(1),
				reviewCount: summary.count,
				bestRating: 5,
				worstRating: 1,
			},
			review: reviews.slice(0, 10).map((r) => ({
				"@type": "Review",
				author: { "@type": "Person", name: r.author },
				datePublished: r.date,
				reviewBody: r.text,
				reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
			})),
		}),
	};
}

export function breadcrumbJsonLd(
	items: { name: string; href: string }[],
) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: `${SITE_URL}${item.href}`,
		})),
	};
}

export function blogPostJsonLd(post: WPPost) {
	const author = post._embedded?.author?.[0]?.name ?? "Abraxas";
	const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title.rendered.replace(/<[^>]+>/g, ""),
		datePublished: post.date,
		author: {
			"@type": "Person",
			name: author,
		},
		publisher: {
			"@type": "Organization",
			name: SITE_NAME,
		},
		...(image && { image }),
		description: post.excerpt.rendered.replace(/<[^>]+>/g, "").slice(0, 160),
		mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
	};
}
