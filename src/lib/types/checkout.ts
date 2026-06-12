// ── Datos del formulario de checkout ──

export interface CheckoutFormData {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	address: string;
	city: string;
	postalCode?: string;
	notes?: string;
	// Dirección de envío alternativa (si difiere de la de contacto)
	shippingAddress?: string;
	shippingCity?: string;
	shippingPostalCode?: string;
}

// ── Request / Response de la API ──

export interface CheckoutLineItem {
	productId: number;
	/** ID de la variación elegida (productos `variable`) */
	variationId?: number;
	quantity: number;
	price: string;
	name: string;
	/** Campos personalizados (ACF / grabado) → meta_data del line_item */
	personalization?: { label: string; value: string }[];
}

export type PaymentMethod = "mercadopago" | "bank_transfer";

export interface CheckoutRequest {
	customer: CheckoutFormData;
	items: CheckoutLineItem[];
	paymentMethod: PaymentMethod;
	/** Datos del token generado por MercadoPago Bricks (solo para pago con tarjeta) */
	mpFormData?: Record<string, unknown>;
}

export interface CheckoutResponse {
	orderId: number;
	initPoint?: string;
	method?: PaymentMethod;
}

// ── MercadoPago ──

export interface MPPreference {
	id: string;
	init_point: string;
	sandbox_init_point: string;
}

export interface MPWebhookPayload {
	id: number;
	live_mode: boolean;
	type: string;
	date_created: string;
	action: string;
	data: {
		id: string;
	};
}

export interface MPPayment {
	id: number;
	status: string;
	status_detail: string;
	external_reference: string;
	transaction_amount: number;
	currency_id: string;
	payer: {
		email: string;
	};
}
