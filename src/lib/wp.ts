import type { AuthResult, WCAttributeTerm, WPCategory, WPPost, WPProduct, WPReview, WPVariation } from './types';

const wpBaseUrl = process.env.NEXT_PUBLIC_WP_URL;
const authEndpoint =
	process.env.WP_AUTH_ENDPOINT ??
	`${wpBaseUrl}/wp-json/jwt-auth/v1/token`;
const wcKey = process.env.WC_CONSUMER_KEY;
const wcSecret = process.env.WC_CONSUMER_SECRET;

// Mensaje único que ven los clientes cuando WordPress no responde correctamente.
// El detalle técnico va siempre a console.error, nunca a la pantalla.
const API_ERROR_MESSAGE =
	'No pudimos cargar la información en este momento. Por favor, intentá de nuevo en unos minutos.';

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

async function wpFetch(
	path: string,
	revalidate: number,
	{ auth = true, tag = 'woocommerce' }: { auth?: boolean; tag?: string } = {},
): Promise<Response> {
	ensureWpUrl();

	const url = new URL(path, wpBaseUrl);
	if (auth) withWooAuth(url);

	let response: Response;
	try {
		response = await fetch(url.toString(), {
			next: { revalidate, tags: [tag] },
		});
	} catch (error) {
		console.error(`[wp] Fallo de red al pedir ${path}:`, error);
		throw new Error(API_ERROR_MESSAGE);
	}

	if (!response.ok) {
		console.error(`[wp] ${path} respondió ${response.status} ${response.statusText}`);
		throw new Error(API_ERROR_MESSAGE);
	}

	return response;
}

// WordPress puede responder 200 con el cuerpo vacío (o con HTML) cuando PHP falla
// o un plugin rompe la REST API. En ese caso response.json() lanza
// «Unexpected end of JSON input», que antes llegaba tal cual al cliente.
async function readJson<T>(response: Response, path: string): Promise<T> {
	const body = await response.text();

	if (!body.trim()) {
		console.error(
			`[wp] ${path} respondió ${response.status} con el cuerpo vacío: la REST API de WordPress no está devolviendo JSON.`,
		);
		throw new Error(API_ERROR_MESSAGE);
	}

	try {
		return JSON.parse(body) as T;
	} catch {
		const contentType = response.headers.get('content-type') ?? 'desconocido';
		console.error(
			`[wp] ${path} respondió algo que no es JSON (content-type: ${contentType}): ${body.slice(0, 300)}`,
		);
		throw new Error(API_ERROR_MESSAGE);
	}
}

async function wcGet<T>(path: string, revalidate = 1800): Promise<T> {
	const response = await wpFetch(path, revalidate);
	return readJson<T>(response, path);
}

export async function fetchProducts({ perPage = 12, category, onSale, page = 1, search }: { perPage?: number; category?: number; onSale?: boolean; page?: number; search?: string } = {}) {
	let path = `/wp-json/wc/v3/products?per_page=${perPage}&page=${page}&status=publish`;
	if (category) path += `&category=${category}`;
	if (onSale) path += `&on_sale=true`;
	if (search) path += `&search=${encodeURIComponent(search)}`;

	const response = await wpFetch(path, 1800);
	const data = await readJson<WPProduct[]>(response, path);
	const totalPages = parseInt(response.headers.get('x-wp-totalpages') ?? '1', 10);
	const total = parseInt(response.headers.get('x-wp-total') ?? '0', 10);

	return { data, totalPages, total };
}

export async function fetchProduct(id: number) {
	const product = await wcGet<WPProduct>(`/wp-json/wc/v3/products/${id}`, 900);
	if (product.status !== 'publish') throw new Error('Producto no encontrado');
	return product;
}

export async function fetchProductBySlug(slug: string) {
	const results = await wcGet<WPProduct[]>(`/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}&status=publish`, 900);
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
	const path = `/wp-json/wp/v2/posts?per_page=${perPage}&_embed`;
	const response = await wpFetch(path, 3600, { auth: false, tag: 'posts' });
	return readJson<WPPost[]>(response, path);
}

export async function fetchPost(slug: string) {
	const path = `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`;
	const response = await wpFetch(path, 3600, { auth: false, tag: 'posts' });
	const posts = await readJson<WPPost[]>(response, path);
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
