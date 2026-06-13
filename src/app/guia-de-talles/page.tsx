import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Guía de talles de anillos | Abraxas Joyería",
  description:
    "Aprendé a medir tu talle de anillo en casa con una tira de papel o un anillo que ya tengas, y consultá la tabla de equivalencias (circunferencia y diámetro en mm).",
  openGraph: {
    title: "Guía de talles de anillos | Abraxas Joyería",
    description:
      "Cómo medir tu talle de anillo en casa y tabla de equivalencias en milímetros.",
  },
};

// Talle = circunferencia interior en mm (sistema por circunferencia, ISO 8653).
// El diámetro se deriva como circunferencia / π.
const SIZES = [
  { circ: 48, diam: 15.3 },
  { circ: 50, diam: 15.9 },
  { circ: 52, diam: 16.6 },
  { circ: 54, diam: 17.2 },
  { circ: 56, diam: 17.8 },
  { circ: 58, diam: 18.5 },
  { circ: 60, diam: 19.1 },
  { circ: 62, diam: 19.7 },
  { circ: 64, diam: 20.4 },
  { circ: 66, diam: 21.0 },
  { circ: 68, diam: 21.6 },
];

export default function GuiaDeTallesPage() {
  return (
    <main className="mx-auto max-w-[820px] px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Inicio", href: "/" },
              { name: "Guía de talles", href: "/guia-de-talles" },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Guía de talles" }]}
      />

      <h1 className="mt-0 mb-3 text-3xl font-light tracking-tight">
        Guía de talles de anillos
      </h1>
      <p className="mb-10 max-w-[60ch] text-[15px] leading-relaxed text-[var(--color-muted)]">
        Encontrar tu talle es muy fácil. Podés medirlo en casa en un minuto con
        una tira de papel o tomando como referencia un anillo que ya uses. Ante
        cualquier duda, escribinos y te ayudamos.
      </p>

      {/* Métodos */}
      <section className="space-y-6">
        <article className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h2 className="mt-0 mb-2 text-lg">Método 1 · Con una tira de papel</h2>
          <ol className="m-0 list-decimal space-y-1.5 pl-5 text-sm text-[var(--color-muted)]">
            <li>Cortá una tira fina de papel de unos 10 cm.</li>
            <li>Envolvéla alrededor de la base del dedo, sin apretar.</li>
            <li>Marcá con un lápiz el punto donde se cierra el círculo.</li>
            <li>Estirá la tira y medí los milímetros hasta la marca.</li>
            <li>
              Ese número es la <strong>circunferencia</strong>: buscalo en la
              tabla para ver tu talle.
            </li>
          </ol>
        </article>

        <article className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h2 className="mt-0 mb-2 text-lg">
            Método 2 · Con un anillo que ya tengas
          </h2>
          <p className="m-0 text-sm text-[var(--color-muted)]">
            Tomá un anillo que te quede bien en ese dedo y medí su{" "}
            <strong>diámetro interno</strong> (de borde a borde por dentro) en
            milímetros con una regla. Buscá ese diámetro en la tabla para
            encontrar el talle equivalente.
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h2 className="mt-0 mb-2 text-lg">Consejos para medir bien</h2>
          <ul className="m-0 list-disc space-y-1.5 pl-5 text-sm text-[var(--color-muted)]">
            <li>Medí al final del día, cuando el dedo está un poco más ancho.</li>
            <li>Evitá medir con frío: los dedos se afinan.</li>
            <li>
              Si estás entre dos talles, elegí el mayor (sobre todo en anillos
              anchos).
            </li>
            <li>Medí el dedo exacto donde vas a usar el anillo.</li>
          </ul>
        </article>
      </section>

      {/* Tabla */}
      <section className="mt-10">
        <h2 className="mb-3 text-xl">Tabla de equivalencias</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          El talle corresponde a la <strong>circunferencia interior en
          milímetros</strong>. Usá el diámetro como referencia si medís un
          anillo existente.
        </p>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-line)]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--color-panel)] text-left">
                <th className="px-4 py-3 font-semibold">Talle</th>
                <th className="px-4 py-3 font-semibold">Circunferencia (mm)</th>
                <th className="px-4 py-3 font-semibold">Diámetro (mm)</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s, i) => (
                <tr
                  key={s.circ}
                  className={i % 2 === 0 ? "" : "bg-[var(--color-panel)]/40"}
                >
                  <td className="border-t border-[var(--color-line)] px-4 py-2.5 font-semibold">
                    {s.circ}
                  </td>
                  <td className="border-t border-[var(--color-line)] px-4 py-2.5 text-[var(--color-muted)]">
                    {s.circ}
                  </td>
                  <td className="border-t border-[var(--color-line)] px-4 py-2.5 text-[var(--color-muted)]">
                    {s.diam.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 rounded-2xl border border-[var(--color-brand)]/40 bg-[var(--color-brand)]/5 p-6 text-center">
        <p className="m-0 mb-1 font-semibold text-[var(--color-ink)]">
          ¿No estás seguro de tu talle?
        </p>
        <p className="m-0 mb-4 text-sm text-[var(--color-muted)]">
          Escribinos por WhatsApp con tu medida y te confirmamos el talle ideal.
        </p>
        <a
          href="https://wa.me/59898842100"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-bold text-[#f6fffb] transition-colors hover:bg-[var(--color-brand-strong)]"
        >
          Consultar por WhatsApp
        </a>
      </section>
    </main>
  );
}
