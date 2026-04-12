import type { Metadata } from "next";
import { fetchCategories } from "@/lib/wp";
import type { WPCategory } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Categorías | Abraxas Joyería",
  description: "Explora nuestras colecciones de joyería artesanal. Anillos, colgantes, caravanas y más.",
  openGraph: {
    title: "Categorías | Abraxas Joyería",
    description: "Explora nuestras colecciones de joyería artesanal.",
  },
};

export default async function CategoriasPage() {
  let categories: WPCategory[] = [];
  let error = "";

  try {
    categories = await fetchCategories();
    // Filter out "Uncategorized"
    categories = categories.filter((c) => c.slug !== "uncategorized");
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudieron cargar las categorías";
  }

  return (
    <main className="mx-auto max-w-[1080px] px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/productos" className="font-semibold text-[var(--color-brand-strong)]">
          Volver
        </Link>
        <h1>Categorías</h1>
      </div>

      {error && (
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3">
          {error}
        </p>
      )}

      {!error && categories.length === 0 && (
        <p className="text-[var(--color-muted)]">No hay categorías todavía.</p>
      )}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel)] transition-shadow hover:shadow-md"
          >
            {cat.image ? (
              <Image
                src={cat.image.src}
                alt={cat.image.alt || cat.name}
                width={400}
                height={160}
                className="h-[160px] w-full bg-[#1c1a18] object-cover"
              />
            ) : (
              <div className="flex h-[160px] items-center justify-center bg-[#1c1a18] text-4xl text-[var(--color-muted)]">
                {cat.name.charAt(0)}
              </div>
            )}
            <div className="p-4">
              <h2 className="m-0 mb-1 text-base">{cat.name}</h2>
              <p className="m-0 text-sm text-[var(--color-muted)]">
                {cat.count} {cat.count === 1 ? "producto" : "productos"}
              </p>
              {cat.description && (
                <p className="mt-1 m-0 line-clamp-2 text-sm text-[var(--color-muted)]">
                  {cat.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
