import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contacto | Abraxas Joyería",
	description:
		"Ponte en contacto con Abraxas Joyería. Estamos en Montevideo, Uruguay.",
	alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
