import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros | Abraxas",
  description: "Conoce la historia y filosofía detrás de Abraxas joyería.",
  alternates: { canonical: "/nosotros" },
};

export default function NosotrosPage() {
  return (
    <main className="mx-auto max-w-[860px] px-6 py-16">
      <h1 className="mb-2 text-3xl font-light tracking-[0.18em] uppercase text-[var(--color-ink)]">
        Nosotros
      </h1>
      <p className="mb-12 text-sm tracking-widest text-[var(--color-muted)] uppercase">
        Historia · Filosofía · Artesanía
      </p>

      <div className="space-y-8 text-[15px] leading-relaxed text-[var(--color-muted)]">
        <p>
          Abraxas nació de la pasión por convertir metales nobles y piedras preciosas en
          piezas que trascienden el tiempo. Cada joya lleva consigo horas de trabajo artesanal,
          respeto por los materiales y una búsqueda constante de la belleza esencial.
        </p>
        <p>
          Trabajamos con orfebres de tradición, seleccionando materiales de origen responsable
          y colaborando con artesanos que comparten nuestra filosofía: crear objetos únicos que
          acompañen momentos únicos.
        </p>
        <p>
          El nombre Abraxas evoca lo eterno, lo que permanece más allá de las modas.
          Esa es nuestra promesa: diseño atemporal con calidad que dura generaciones.
        </p>
      </div>
    </main>
  );
}
