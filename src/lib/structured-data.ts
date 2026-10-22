import type { WPProduct, WPPost } from "./types";
import { summarizeReviews, type Review } from "./reviews";

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
	};
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
		shippingDetails: {
			"@type": "OfferShippingDetails",
			shippingRate: {
				"@type": "MonetaryAmount",
				value: 0,
				currency: "UYU",
			},
			shippingDestination: {
				"@type": "DefinedRegion",
				addressCountry: "UY",
			},
		},
		hasMerchantReturnPolicy: {
			"@type": "MerchantReturnPolicy",
			applicableCountry: "UY",
			returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnPeriod",
			merchantReturnDays: 30,
			returnMethod: "https://schema.org/ReturnByMail",
			returnFees: "https://schema.org/FreeReturn",
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
