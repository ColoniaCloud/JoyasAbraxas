import { NextResponse } from "next/server";
import { getMPPayment, updateWCOrderStatus } from "@/lib/services/checkout";

// Mapeo de estados MercadoPago → WooCommerce
const MP_TO_WC_STATUS: Record<string, string> = {
	approved: "processing",
	pending: "on-hold",
	in_process: "on-hold",
	rejected: "failed",
	cancelled: "cancelled",
	refunded: "refunded",
};

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Solo procesar notificaciones de tipo payment
		if (body.type !== "payment") {
			return NextResponse.json({ received: true });
		}

		const paymentId = body.data?.id;
		if (!paymentId) {
			return NextResponse.json(
				{ error: "Missing payment ID" },
				{ status: 400 },
			);
		}

		// Consultar el pago real en MercadoPago (nunca confiar en el body del webhook)
		const payment = await getMPPayment(String(paymentId));

		const orderId = parseInt(payment.external_reference, 10);
		if (!orderId || isNaN(orderId)) {
			return NextResponse.json(
				{ error: "Invalid external_reference" },
				{ status: 400 },
			);
		}

		// Actualizar estado del pedido en WooCommerce
		const wcStatus = MP_TO_WC_STATUS[payment.status] || "on-hold";
		await updateWCOrderStatus(orderId, wcStatus, String(payment.id));

		return NextResponse.json({
			received: true,
			orderId,
			status: wcStatus,
		});
	} catch (error) {
		console.error("[webhook/mercadopago]", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}
}
