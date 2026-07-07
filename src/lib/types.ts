export interface WPImage {
	id: number;
	src: string;
	name: string;
	alt: string;
}

export interface WPProductCategory {
	id: number;
	name: string;
	slug: string;
}

export interface WPProductAttribute {
	id: number;
	name: string;
	slug?: string;
	position?: number;
	options: string[];
	variation?: boolean;
	visible?: boolean;
}

export interface WCAttributeTerm {
	id: number;
	name: string;
	slug: string;
	count: number;
	image: WPImage | null;
}

/** Un par clave/valor de meta de WooCommerce (post meta, ACF crudo, etc.) */
export interface WPMeta {
	id?: number;
	key: string;
	value: unknown;
}

/** Atributo concreto de una variación (ya resuelto a una opción) */
export interface WPVariationAttribute {
	id: number;
	name: string;
	slug: string;
	/** Opción elegida. Vacío ("") significa "cualquiera" en WooCommerce */
	option: string;
}

/** Una variación de un producto `variable` (combinación concreta de atributos) */
export interface WPVariation {
	id: number;
	price: string;
	regular_price: string;
	sale_price: string;
	sku: string;
	stock_status: string;
	attributes: WPVariationAttribute[];
	image: WPImage | null;
}

/**
 * Personalización elegida por el cliente para un producto.
 *  - `variationId` + `variationAttributes`: para productos `variable` (precio/stock reales los maneja WooCommerce vía el variation_id).
 *  - `personalization`: campos libres / ACF que viajan como `meta_data` del line_item.
 */
export interface ProductCustomization {
	variationId?: number;
	/** Precio real de la variación elegida (para carrito y total) */
	variationPrice?: string;
	/** Atributos de la variación, solo para mostrar en carrito/checkout */
	variationAttributes?: { name: string; option: string }[];
	/** Campos personalizados (ACF / grabado / nota) → meta_data del pedido */
	personalization?: { label: string; value: string }[];
	/** Nota libre del cliente para este producto → se adjunta como nota del pedido (customer_note) */
	note?: string;
}

export interface WPProduct {
	id: number;
	name: string;
	slug: string;
	permalink: string;
	type: string;
	status: string;
	price: string;
	regular_price: string;
	sale_price: string;
	short_description: string;
	description: string;
	average_rating: string;
	rating_count: number;
	images: WPImage[];
	stock_status: string;
	sku: string;
	categories: WPProductCategory[];
	attributes: WPProductAttribute[];
	/** IDs de las variaciones (vacío en productos `simple`) */
	variations: number[];
	has_options?: boolean;
	meta_data?: WPMeta[];
	/** Campos ACF si el backend los expone bajo la clave `acf` */
	acf?: Record<string, unknown>;
	related_ids: number[];
}

export interface WPCategory {
	id: number;
	name: string;
	slug: string;
	description: string;
	count: number;
	image: WPImage | null;
	parent: number;
}

export interface WPReview {
	id: number;
	reviewer: string;
	review: string;
	rating: number;
	date_created: string;
	product_id: number;
}

export interface WPPost {
	id: number;
	slug: string;
	title: { rendered: string };
	excerpt: { rendered: string };
	content: { rendered: string };
	date: string;
	featured_media: number;
	_embedded?: {
		"wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>;
		author?: Array<{ name: string }>;
	};
}

export interface AuthResult {
	token: string;
	user_email: string;
	user_nicename: string;
	user_display_name: string;
}

export interface CartItem {
	/** Clave única de línea: `${product.id}:${variationId ?? 0}` */
	key: string;
	product: WPProduct;
	quantity: number;
	customization?: ProductCustomization;
}
