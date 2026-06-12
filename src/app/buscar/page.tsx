import type { Metadata } from "next";
import { fetchProducts } from "@/lib/wp";
import type { WPProduct } from "@/lib/types";
import Link from "next/link";
import ProductCard from "@/components/product-card";

export const metadata: Metadata = {
  title: "Buscar | Abraxas Joyería",
  description: "Buscá en el catálogo de joyería artesanal Abraxas.",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  let products: WPProduct[] = [];
  let errorMessage = "";

  if (query) {
    try {
      const result = await fetchProducts({ perPage: 24, search: query });
      products = result.data;
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "No se pudo realizar la búsqueda";
    }
  }

  return (
    <main className="mx-auto max-w-[1080px] px-4 py-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-[var(--color-brand-strong)]">
          Volver
        </Link>
        <h1>Búsqueda</h1>
      </div>

      {!query && (
        <p className="mt-4 text-[var(--color-muted)]">
          Escribí algo en el buscador para encontrar productos.
        </p>
      )}

      {query && !errorMessage && (
        <p className="mt-2 mb-4 text-sm text-[var(--color-muted)]">
          {products.length > 0
            ? `${products.length} resultado${products.length === 1 ? "" : "s"} para “${query}”`
            : `Sin resultados para “${query}”.`}
        </p>
      )}

      {errorMessage && (
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3">
          {errorMessage}
        </p>
      )}

      {products.length > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </main>
  );
}
