import type { Metadata } from "next";
import { fetchPosts } from "@/lib/wp";
import type { WPPost } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog | Abraxas",
  description:
    "Historias, cuidados y tendencias de joyería artesanal. El blog de Abraxas Joyería.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  let posts: WPPost[] = [];
  let error = "";

  try {
    posts = await fetchPosts({ perPage: 12 });
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudieron cargar los posts";
  }

  return (
    <main className="mx-auto max-w-[1080px] px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-[var(--color-brand-strong)]">
          Volver
        </Link>
        <h1>Blog</h1>
      </div>

      {error && (
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3">
          {error}
        </p>
      )}

      {!error && posts.length === 0 && (
        <p className="text-[var(--color-muted)]">No hay publicaciones todavia.</p>
      )}

      <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {posts.map((post) => {
          const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];
          const author = post._embedded?.author?.[0]?.name;
          const date = new Date(post.date).toLocaleDateString("es", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel)] transition-shadow hover:shadow-md"
            >
              {featuredImage && (
                <Image
                  src={featuredImage.source_url}
                  alt={featuredImage.alt_text || post.title.rendered}
                  width={600}
                  height={250}
                  className="h-[200px] w-full bg-[#1c1a18] object-cover"
                />
              )}
              <div className="p-4">
                <h2
                  className="m-0 mb-2 text-lg"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
                <div
                  className="mb-3 line-clamp-3 text-sm text-[var(--color-muted)] [&_p]:m-0"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  {author && <span>{author}</span>}
                  {author && <span>·</span>}
                  <time>{date}</time>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
