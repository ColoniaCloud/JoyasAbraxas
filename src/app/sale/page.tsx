import type { Metadata } from "next";
import { fetchProducts } from "@/lib/wp";
import type { WPProduct } from "@/lib/types";
import ProductCard from "@/components/product-card";

export const metadata: Metadata = {
  title: "Sale | Abraxas Joyería",
  description: "Ofertas y descuentos en joyería artesanal Abraxas. Piezas seleccionadas a precios especiales.",
  alternates: { canonical: "/sale" },
  openGraph: {
    title: "Sale | Abraxas Joyería",
    description: "Ofertas y descuentos en joyería artesanal Abraxas.",
    url: "/sale",
  },
};

export default async function SalePage() {
  let products: WPProduct[] = [];
  let error = "";

  try {
    const result = await fetchProducts({ perPage: 50, onSale: true });
    products = result.data;
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudieron cargar los productos";
  }

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-12">
      <h1 className="mb-1 text-3xl font-light tracking-[0.18em] uppercase text-[var(--color-ink)]">
        Sale
      </h1>
      <p className="mb-10 text-sm tracking-widest text-[var(--color-muted)] uppercase">
        Piezas seleccionadas con descuento
      </p>

      {error && (
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {!error && products.length === 0 && (
        <p className="text-[var(--color-muted)]">No hay ofertas disponibles en este momento.</p>
      )}

      <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
