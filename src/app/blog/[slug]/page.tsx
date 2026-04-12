import { fetchPost } from "@/lib/wp";
import { sanitize } from "@/lib/sanitize";
import { blogPostJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchPost(slug);
    if (!post) return { title: "Artículo | Abraxas" };
    return {
      title: `${post.title.rendered} | Abraxas`,
      description: post.excerpt.rendered.replace(/<[^>]+>/g, "").slice(0, 160),
    };
  } catch {
    return { title: "Artículo | Abraxas" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  let error = "";

  try {
    post = await fetchPost(slug);
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudo cargar el artículo";
  }

  if (error || !post) {
    return (
      <main className="mx-auto max-w-[720px] px-4 py-8">
        <Link href="/blog" className="font-semibold text-[var(--color-brand-strong)]">
          Volver al blog
        </Link>
        <p className="my-4 rounded-lg border border-red-900/40 bg-red-950/40 p-3">
          {error || "Artículo no encontrado"}
        </p>
      </main>
    );
  }

  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  const author =
    post._embedded?.author?.[0]?.name ?? "Abraxas";
  const date = new Date(post.date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-[720px] px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostJsonLd(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Inicio", href: "/" },
              { name: "Blog", href: "/blog" },
              { name: post.title.rendered.replace(/<[^>]+>/g, ""), href: `/blog/${post.slug}` },
            ])
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title.rendered.replace(/<[^>]+>/g, "") },
        ]}
      />

      {featuredImage && (
        <Image
          src={featuredImage}
          alt={post.title.rendered}
          width={720}
          height={400}
          className="mb-6 w-full rounded-[14px] object-cover"
        />
      )}

      <h1 className="mb-2" dangerouslySetInnerHTML={{ __html: sanitize(post.title.rendered) }} />

      <p className="mb-6 text-sm text-[var(--color-muted)]">
        Por {author} · {date}
      </p>

      <article
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitize(post.content.rendered) }}
      />
    </main>
  );
}
