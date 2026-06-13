import type { Metadata } from "next";
import { fetchProducts } from "@/lib/wp";
import type { WPProduct } from "@/lib/types";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import Pagination from "@/components/pagination";

export const metadata: Metadata = {
  title: "Catálogo | Abraxas Joyería",
  description: "Explora nuestro catálogo completo de joyería artesanal. Anillos, colgantes, caravanas y más.",
  alternates: { canonical: "/productos" },
  openGraph: {
    title: "Catálogo | Abraxas Joyería",
    description: "Explora nuestro catálogo completo de joyería artesanal.",
    url: "/productos",
  },
};

interface Props {
  searchParams: Promise<{ pagina?: string }>;
}

export default async function ProductosPage({ searchParams }: Props) {
  const { pagina } = await searchParams;
  const currentPage = Math.max(1, parseInt(pagina ?? "1", 10) || 1);
  let products: WPProduct[] = [];
  let totalPages = 1;
  let errorMessage = "";

  try {
    const result = await fetchProducts({ perPage: 16, page: currentPage });
    products = result.data;
    totalPages = result.totalPages;
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los productos";
  }

  return (
    <main className="mx-auto max-w-[1080px] px-4 py-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-semibold text-[var(--color-brand-strong)]"
        >
          Volver
        </Link>
        <h1>Catálogo</h1>
      </div>

      {errorMessage && (
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3">
          {errorMessage}
        </p>
      )}

      {!errorMessage && products.length === 0 && (
        <p>No hay productos para mostrar.</p>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/productos" />
    </main>
  );
}
