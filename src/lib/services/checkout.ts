import type { CheckoutFormData, MPPreference, MPPayment } from "@/lib/types/checkout";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;
const WC_KEY = process.env.WC_CONSUMER_KEY!;
const WC_SECRET = process.env.WC_CONSUMER_SECRET!;
const MP_TOKEN = process.env.MP_ACCESS_TOKEN!;

// ── WooCommerce Orders ──

export async function createWCOrder(
	customer: CheckoutFormData,
	items: { productId: number; quantity: number }[],
) {
	const url = new URL("/wp-json/wc/v3/orders", WP_URL);
	url.searchParams.set("consumer_key", WC_KEY);
	url.searchParams.set("consumer_secret", WC_SECRET);

	const body = {
		payment_method: "mercadopago",
		payment_method_title: "MercadoPago",
		set_paid: false,
		status: "pending",
		billing: {
			first_name: customer.firstName,
			last_name: customer.lastName,
			email: customer.email,
			phone: customer.phone || "",
			address_1: customer.address,
			city: customer.city,
			postcode: customer.postalCode || "",
			country: "UY",
		},
		shipping: {
			first_name: customer.firstName,
			last_name: customer.lastName,
			address_1: customer.address,
			city: customer.city,
			postcode: customer.postalCode || "",
			country: "UY",
		},
		line_items: items.map((item) => ({
			product_id: item.productId,
			quantity: item.quantity,
		})),
		customer_note: customer.notes || "",
	};

	const res = await fetch(url.toString(), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			error.message || `Error creando pedido: ${res.status}`,
		);
	}

	return res.json() as Promise<{ id: number; total: string }>;
}

// ── MercadoPago Preferences ──

export async function createMPPreference(
	orderId: number,
	items: { name: string; quantity: number; price: number }[],
	customerEmail: string,
): Promise<MPPreference> {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

	const body = {
		items: items.map((item) => ({
			title: item.name,
			quantity: item.quantity,
			unit_price: item.price,
			currency_id: "UYU",
		})),
		payer: { email: customerEmail },
		back_urls: {
			success: `${siteUrl}/checkout/resultado?status=success`,
			failure: `${siteUrl}/checkout/resultado?status=failure`,
			pending: `${siteUrl}/checkout/resultado?status=pending`,
		},
		auto_return: "approved",
		external_reference: String(orderId),
		notification_url: `${siteUrl}/api/webhooks/mercadopago`,
		statement_descriptor: "JOYAS ABRAXAS",
	};

	const res = await fetch(
		"https://api.mercadopago.com/checkout/preferences",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${MP_TOKEN}`,
			},
			body: JSON.stringify(body),
		},
	);

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(
			error.message || `Error creando preferencia MP: ${res.status}`,
		);
	}

	return res.json() as Promise<MPPreference>;
}

// ── MercadoPago Payments (consulta) ──

export async function getMPPayment(paymentId: string): Promise<MPPayment> {
	const res = await fetch(
		`https://api.mercadopago.com/v1/payments/${paymentId}`,
		{
			headers: { Authorization: `Bearer ${MP_TOKEN}` },
		},
	);

	if (!res.ok) {
		throw new Error(`Pago ${paymentId} no encontrado: ${res.status}`);
	}

	return res.json() as Promise<MPPayment>;
}

// ── WooCommerce Order Status ──

export async function updateWCOrderStatus(
	orderId: number,
	status: string,
	transactionId?: string,
) {
	const url = new URL(`/wp-json/wc/v3/orders/${orderId}`, WP_URL);
	url.searchParams.set("consumer_key", WC_KEY);
	url.searchParams.set("consumer_secret", WC_SECRET);

	const body: Record<string, unknown> = { status };
	if (transactionId) {
		body.transaction_id = transactionId;
	}

	const res = await fetch(url.toString(), {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		throw new Error(
			`Error actualizando pedido ${orderId}: ${res.status}`,
		);
	}

	return res.json();
}
