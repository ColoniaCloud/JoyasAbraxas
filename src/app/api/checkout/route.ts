import { NextResponse } from "next/server";
import type { CheckoutRequest } from "@/lib/types/checkout";
import { createWCOrder, createMPPreference } from "@/lib/services/checkout";

export async function POST(request: Request) {
	try {
		const body: CheckoutRequest = await request.json();

		// Validación básica
		if (!body.customer?.email || !body.items?.length) {
			return NextResponse.json(
				{ error: "Faltan datos del cliente o productos" },
				{ status: 400 },
			);
		}

		if (!body.customer.firstName || !body.customer.lastName) {
			return NextResponse.json(
				{ error: "Nombre y apellido son requeridos" },
				{ status: 400 },
			);
		}

		if (!body.customer.address || !body.customer.city) {
			return NextResponse.json(
				{ error: "Dirección y ciudad son requeridos" },
				{ status: 400 },
			);
		}

		// 1. Crear pedido en WooCommerce (status: pending)
		const order = await createWCOrder(
			body.customer,
			body.items.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
			})),
		);

		// 2. Crear preferencia de pago en MercadoPago
		const preference = await createMPPreference(
			order.id,
			body.items.map((item) => ({
				name: item.name,
				quantity: item.quantity,
				price: parseFloat(item.price),
			})),
			body.customer.email,
		);

		// 3. Devolver URL de pago al frontend
		return NextResponse.json({
			orderId: order.id,
			initPoint: preference.init_point,
		});
	} catch (error) {
		console.error("[checkout]", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Error procesando el checkout",
			},
			{ status: 500 },
		);
	}
}
