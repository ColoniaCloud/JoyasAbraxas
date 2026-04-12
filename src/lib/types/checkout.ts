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
}

// ── Request / Response de la API ──

export interface CheckoutLineItem {
	productId: number;
	quantity: number;
	price: string;
	name: string;
}

export interface CheckoutRequest {
	customer: CheckoutFormData;
	items: CheckoutLineItem[];
}

export interface CheckoutResponse {
	orderId: number;
	initPoint: string;
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
