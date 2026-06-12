import { NextResponse } from "next/server";
import type { CheckoutRequest } from "@/lib/types/checkout";
import { createWCOrder, processMPPayment, updateWCOrderStatus } from "@/lib/services/checkout";

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

		const paymentMethod = body.paymentMethod ?? "mercadopago";

		// 1. Crear pedido en WooCommerce
		const order = await createWCOrder(
			body.customer,
			body.items.map((item) => ({
				productId: item.productId,
				variationId: item.variationId,
				quantity: item.quantity,
				personalization: item.personalization,
			})),
			paymentMethod,
		);

		// 2a. Transferencia bancaria: devolver directamente
		if (paymentMethod === "bank_transfer") {
			return NextResponse.json({
				orderId: order.id,
				method: "bank_transfer",
			});
		}

		// 2b. MercadoPago Bricks: procesar pago con el token del brick
		if (!body.mpFormData) {
			return NextResponse.json(
				{ error: "Faltan datos de pago de MercadoPago" },
				{ status: 400 },
			);
		}

		const totalAmount = body.items.reduce(
			(sum, item) => sum + parseFloat(item.price) * item.quantity,
			0,
		);

		const payment = await processMPPayment(
			order.id,
			totalAmount,
			body.mpFormData,
			body.customer.email,
		);

		// Actualizar estado del pedido en WooCommerce según resultado
		if (payment.status === "approved") {
			await updateWCOrderStatus(order.id, "processing", String(payment.id));
		}

		const resultStatus =
			payment.status === "approved"
				? "success"
				: payment.status === "in_process" || payment.status === "pending"
				? "pending"
				: "failure";

		return NextResponse.json({
			orderId: order.id,
			paymentStatus: payment.status,
			resultStatus,
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
