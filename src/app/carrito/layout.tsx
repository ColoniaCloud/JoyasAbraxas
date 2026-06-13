import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito | Abraxas Joyería",
  robots: { index: false, follow: true },
};

export default function CarritoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
