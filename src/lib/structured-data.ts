import type { WPProduct, WPPost } from "./types";

const SITE_NAME = "Abraxas Joyería";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joyasabraxas.com";

export function organizationJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "JewelryStore",
		name: SITE_NAME,
		url: SITE_URL,
		logo: `${SITE_URL}/branding/logo.png`,
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
	};
}

export function productJsonLd(product: WPProduct) {
	const offers: Record<string, unknown> = {
		"@type": "Offer",
		priceCurrency: "UYU",
		price: product.price,
		availability:
			product.stock_status === "instock"
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock",
		url: `${SITE_URL}/productos/${product.slug}`,
	};

	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		description: product.short_description?.replace(/<[^>]+>/g, "").slice(0, 300),
		image: product.images.map((img) => img.src),
		sku: product.sku || undefined,
		offers,
		...(product.rating_count > 0 && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: product.average_rating,
				reviewCount: product.rating_count,
			},
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
