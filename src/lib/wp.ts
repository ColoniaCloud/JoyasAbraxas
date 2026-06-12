import type { AuthResult, WCAttributeTerm, WPCategory, WPPost, WPProduct, WPReview, WPVariation } from './types';

const wpBaseUrl = process.env.NEXT_PUBLIC_WP_URL;
const authEndpoint =
	process.env.WP_AUTH_ENDPOINT ??
	`${wpBaseUrl}/wp-json/jwt-auth/v1/token`;
const wcKey = process.env.WC_CONSUMER_KEY;
const wcSecret = process.env.WC_CONSUMER_SECRET;

function ensureWpUrl() {
	if (!wpBaseUrl) {
		throw new Error('Falta NEXT_PUBLIC_WP_URL en el archivo .env');
	}
}

function withWooAuth(url: URL) {
	if (wcKey && wcSecret) {
		url.searchParams.set('consumer_key', wcKey);
		url.searchParams.set('consumer_secret', wcSecret);
	}
}

async function wcGet<T>(path: string, revalidate = 1800): Promise<T> {
	ensureWpUrl();

	const url = new URL(path, wpBaseUrl);
	withWooAuth(url);

	const response = await fetch(url.toString(), {
		next: { revalidate, tags: ['woocommerce'] },
	});
	if (!response.ok) {
		throw new Error(`Error ${response.status}: ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}

export async function fetchProducts({ perPage = 12, category, onSale, page = 1, search }: { perPage?: number; category?: number; onSale?: boolean; page?: number; search?: string } = {}) {
	let path = `/wp-json/wc/v3/products?per_page=${perPage}&page=${page}`;
	if (category) path += `&category=${category}`;
	if (onSale) path += `&on_sale=true`;
	if (search) path += `&search=${encodeURIComponent(search)}`;

	ensureWpUrl();
	const url = new URL(path, wpBaseUrl);
	withWooAuth(url);

	const response = await fetch(url.toString(), {
		next: { revalidate: 1800, tags: ['woocommerce'] },
	});
	if (!response.ok) {
		throw new Error(`Error ${response.status}: ${response.statusText}`);
	}

	const data = (await response.json()) as WPProduct[];
	const totalPages = parseInt(response.headers.get('x-wp-totalpages') ?? '1', 10);
	const total = parseInt(response.headers.get('x-wp-total') ?? '0', 10);

	return { data, totalPages, total };
}

export async function fetchProduct(id: number) {
	return wcGet<WPProduct>(`/wp-json/wc/v3/products/${id}`, 900);
}

export async function fetchProductBySlug(slug: string) {
	const results = await wcGet<WPProduct[]>(`/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}`, 900);
	if (!results.length) throw new Error('Producto no encontrado');
	return results[0];
}

export async function fetchProductReviews(productId: number) {
	return wcGet<WPReview[]>(`/wp-json/wc/v3/products/reviews?product=${productId}`, 1800);
}

export async function fetchCategories({ perPage = 100 } = {}) {
	return wcGet<WPCategory[]>(`/wp-json/wc/v3/products/categories?per_page=${perPage}`, 3600);
}

export async function fetchCategory(id: number) {
	return wcGet<WPCategory>(`/wp-json/wc/v3/products/categories/${id}`, 3600);
}

export async function fetchCategoryBySlug(slug: string) {
	const results = await wcGet<WPCategory[]>(`/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(slug)}`, 3600);
	if (!results.length) throw new Error('Categoría no encontrada');
	return results[0];
}

export async function fetchPosts({ perPage = 12 } = {}) {
	ensureWpUrl();
	const url = new URL(`/wp-json/wp/v2/posts?per_page=${perPage}&_embed`, wpBaseUrl!);
	const response = await fetch(url.toString(), {
		next: { revalidate: 3600, tags: ['posts'] },
	});
	if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
	return response.json() as Promise<WPPost[]>;
}

export async function fetchPost(slug: string) {
	ensureWpUrl();
	const url = new URL(`/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`, wpBaseUrl!);
	const response = await fetch(url.toString(), {
		next: { revalidate: 3600, tags: ['posts'] },
	});
	if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
	const posts = (await response.json()) as WPPost[];
	return posts[0] ?? null;
}

export async function fetchAttributeTerms(attrId: number) {
	return wcGet<WCAttributeTerm[]>(`/wp-json/wc/v3/products/attributes/${attrId}/terms?per_page=50`, 3600);
}

export async function fetchProductVariations(productId: number) {
	return wcGet<WPVariation[]>(`/wp-json/wc/v3/products/${productId}/variations?per_page=100`, 900);
}

export async function loginUser(username: string, password: string) {
	if (!authEndpoint || authEndpoint.includes('undefined')) {
		throw new Error('Falta WP_URL o WP_AUTH_ENDPOINT en el archivo .env');
	}

	const response = await fetch(authEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});

	if (!response.ok) {
		let message = 'No fue posible iniciar sesion';
		try {
			const body = await response.json();
			if (body?.message) {
				message = body.message;
			}
		} catch {
			message = `Error ${response.status}`;
		}

		throw new Error(message);
	}

	return response.json() as Promise<AuthResult>;
}
