import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
	const authEndpoint =
		process.env.WP_AUTH_ENDPOINT ??
		`${wpUrl}/wp-json/jwt-auth/v1/token`;

	if (!wpUrl) {
		return NextResponse.json(
			{ message: "Servidor no configurado" },
			{ status: 500 },
		);
	}

	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return NextResponse.json(
				{ message: "Usuario y contraseña son requeridos" },
				{ status: 400 },
			);
		}

		const response = await fetch(authEndpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});

		const body = await response.json();

		if (!response.ok || !body?.token) {
			return NextResponse.json(
				{ message: body?.message || "Credenciales inválidas" },
				{ status: 401 },
			);
		}

		return NextResponse.json({
			token: body.token,
			user_email: body.user_email,
			user_display_name: body.user_display_name,
		});
	} catch {
		return NextResponse.json(
			{ message: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
