import type { MetadataRoute } from "next";
import { fetchProducts, fetchCategories, fetchPosts } from "@/lib/wp";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.joyasabraxas.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticPages: MetadataRoute.Sitemap = [
		{ url: SITE_URL, changeFrequency: "daily", priority: 1 },
		{ url: `${SITE_URL}/productos`, changeFrequency: "daily", priority: 0.9 },
		{ url: `${SITE_URL}/categorias`, changeFrequency: "weekly", priority: 0.8 },
		{ url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
		{ url: `${SITE_URL}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
		{ url: `${SITE_URL}/contacto`, changeFrequency: "monthly", priority: 0.5 },
		{ url: `${SITE_URL}/sale`, changeFrequency: "daily", priority: 0.8 },
	];

	let productEntries: MetadataRoute.Sitemap = [];
	let categoryEntries: MetadataRoute.Sitemap = [];
	let postEntries: MetadataRoute.Sitemap = [];

	try {
		let page = 1;
		let hasMore = true;
		while (hasMore) {
			const result = await fetchProducts({ perPage: 100, page });
			const entries = result.data.map((p) => ({
				url: `${SITE_URL}/productos/${p.slug}`,
				changeFrequency: "weekly" as const,
				priority: 0.8,
			}));
			productEntries.push(...entries);
			if (page >= result.totalPages) {
				hasMore = false;
			} else {
				page++;
			}
		}
	} catch {
		// API no disponible
	}

	try {
		const categories = await fetchCategories({ perPage: 100 });
		categoryEntries = categories
			.filter((c) => c.slug !== "uncategorized" && c.count > 0)
			.map((c) => ({
				url: `${SITE_URL}/categorias/${c.slug}`,
				changeFrequency: "weekly" as const,
				priority: 0.7,
			}));
	} catch {
		// API no disponible
	}

	try {
		const posts = await fetchPosts({ perPage: 100 });
		postEntries = posts.map((p) => ({
			url: `${SITE_URL}/blog/${p.slug}`,
			changeFrequency: "monthly" as const,
			priority: 0.6,
		}));
	} catch {
		// API no disponible
	}

	return [...staticPages, ...productEntries, ...categoryEntries, ...postEntries];
}
