import type { Metadata } from "next";
import Image from "next/image";
import Accordion, { type AccordionCase } from "@/components/accordion";

export const metadata: Metadata = {
  title: "Garantías | Abraxas Joyería",
  description:
    "Conocé el alcance de la garantía de 2 años de Abraxas Joyería: qué defectos de fabricación cubre, qué no cubre y cómo hacerla efectiva.",
  alternates: { canonical: "/garantia" },
};

const APPLIES: AccordionCase[] = [
  {
    title: "Porosidad o burbujas en la fundición",
    detail:
      "Imperfecciones en el proceso de fundición del metal que afectan la estructura de la pieza están cubiertas por la garantía.",
  },
  {
    title: "Soldadura que se abre sola",
    detail:
      "Si una soldadura cede o se abre sin haber recibido golpes ni un uso forzado, se considera un defecto de fabricación cubierto.",
  },
  {
    title: "Piedra floja por falla de engaste",
    detail:
      "Cuando una piedra se afloja debido a cómo fue engastada originalmente —y no por un golpe o enganche—, está cubierto.",
  },
  {
    title: "Engaste que no sostiene bien la piedra",
    detail:
      "Si el engaste no queda firme o parejo desde el momento de la entrega, se considera un defecto de fabricación.",
  },
  {
    title: "Broche o cierre que no traba",
    detail:
      "Un mecanismo de cierre que no engancha o no sostiene la joya correctamente desde el primer uso está cubierto.",
  },
  {
    title: "Bisagra o pasador defectuoso",
    detail:
      "Fallas en bisagras, pasadores u otros mecanismos que permiten abrir, cerrar o ajustar la pieza.",
  },
  {
    title: "Eslabón que se abre sin motivo",
    detail:
      "Un eslabón de cadena o pulsera que se abre sin haber recibido tensión ni un uso indebido.",
  },
  {
    title: "Golpes o deformación durante el envío",
    detail:
      "Daños que la pieza haya sufrido en el transporte desde Joyas Abraxas hasta tu domicilio.",
  },
  {
    title: "Rotura o falla por el transporte",
    detail:
      "Cualquier desperfecto ocasionado durante el envío, antes de que la pieza llegue a tus manos.",
  },
  {
    title: "Defecto de fabricación presente al recibir la pieza",
    detail:
      "Cualquier anomalía en el metal, el engaste o los mecanismos que ya estaba presente al momento de la entrega.",
  },
];

const NOT_APPLIES: AccordionCase[] = [
  {
    title: "Rayones por el uso diario",
    detail:
      "El desgaste natural de la superficie con el uso cotidiano de la pieza no está cubierto por la garantía.",
  },
  {
    title: "Pérdida de brillo con el tiempo",
    detail:
      "El opacamiento natural del metal por el paso del tiempo y el uso no se considera un defecto de fabricación.",
  },
  {
    title: "Abolladuras o deformación por golpes",
    detail:
      "Los daños causados por golpes, caídas o presión excesiva durante el uso no están cubiertos.",
  },
  {
    title: "Exposición a químicos",
    detail:
      "El contacto con cloro, perfumes o productos de limpieza abrasivos puede dañar la pieza y no está cubierto.",
  },
  {
    title: "Piedra perdida por golpe o enganche",
    detail:
      "Si una piedra se cae por un golpe, un enganche o un uso negligente —y no por una falla del engaste—, no está cubierto.",
  },
  {
    title: "Reparaciones de terceros no autorizados",
    detail:
      "Cualquier modificación o reparación realizada por un joyero ajeno a Abraxas anula la garantía.",
  },
  {
    title: "Tirones o presión excesiva en broches",
    detail: "Forzar un cierre o broche más allá de su uso normal no está cubierto por la garantía.",
  },
  {
    title: "Imperfecciones estéticas menores",
    detail:
      "Pequeñas marcas que no afectan la estructura ni el funcionamiento de la pieza no se consideran defectos.",
  },
  {
    title: "Desgaste del baño o acabado",
    detail: "El desgaste del baño superficial por el uso continuo a lo largo del tiempo no está cubierto.",
  },
  {
    title: "Robo o pérdida de la joya",
    detail: "La garantía cubre defectos de fabricación, no la pérdida ni el robo de la pieza.",
  },
];

const STEPS = [
  "Presentá el Certificado de Garantía original.",
  "Presentá el comprobante de compra original.",
  "Entregá la joya en las condiciones en las que fue recibida, salvo el defecto cubierto por la garantía.",
  "Contactanos para informar el problema y recibir instrucciones sobre el envío o la entrega de la joya para su evaluación.",
];

export default function GarantiaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative -mt-36 flex h-[48vh] min-h-[400px] w-full items-center justify-center overflow-hidden bg-black">
        <Image
          src="/ornament/slider/anillos.jpg"
          alt="Joyería Abraxas"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
        <div
          className="animate-gradient-shift absolute inset-0 bg-[length:200%_200%] opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(192,80,70,0.55) 0%, rgba(0,0,0,0) 35%, rgba(230,124,115,0.35) 65%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[720px] px-6 text-center">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-white/60">
            Garantía Abraxas
          </p>
          <h1 className="font-heading text-[clamp(2.2rem,5vw,3.8rem)] font-light leading-[1.1] text-white">
            La confianza se respalda...
          </h1>
          <p className="mt-4 text-base text-white/75">
            Con 2 años de garantía por defectos de fabricación en cada pieza Abraxas.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-4 py-14 sm:py-16">
        {/* Dos columnas: aplica / no aplica */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="mb-1 text-2xl text-[var(--color-ink)]">¿Cuándo aplica mi garantía?</h2>
            <p className="mb-6 text-sm text-[var(--color-muted)]">
              Cubrimos defectos de fabricación en el metal, el engaste y los mecanismos durante 2 años desde la compra.
            </p>
            <Accordion items={APPLIES} variant="positive" />
          </div>
          <div>
            <h2 className="mb-1 text-2xl text-[var(--color-ink)]">¿Cuándo NO aplica la garantía?</h2>
            <p className="mb-6 text-sm text-[var(--color-muted)]">
              No cubre el desgaste normal, el uso indebido ni las intervenciones de terceros no autorizados.
            </p>
            <Accordion items={NOT_APPLIES} variant="negative" />
          </div>
        </div>

        {/* Procedimiento */}
        <section className="mt-14 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8">
          <h2 className="mb-5 text-2xl text-[var(--color-ink)]">Cómo hacer efectiva la garantía</h2>
          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="m-0 text-sm leading-relaxed text-[var(--color-muted)]">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Limitaciones */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl text-[var(--color-ink)]">Limitaciones de la garantía</h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-muted)]">
            <li>La responsabilidad de Joyas Abraxas se limita a la reparación o reemplazo de la joya defectuosa, según nuestro criterio.</li>
            <li>Nos reservamos el derecho de reemplazar la joya por un modelo similar si el original no está disponible.</li>
            <li>Esta garantía es intransferible y se aplica únicamente al comprador original.</li>
          </ul>
        </section>

        {/* Contacto */}
        <section className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center sm:p-8">
          <h2 className="mb-2 text-xl text-[var(--color-ink)]">¿Tenés dudas sobre tu garantía?</h2>
          <p className="mb-5 text-sm text-[var(--color-muted)]">
            Escribinos y te ayudamos con el proceso de evaluación.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:contacato@joyasabraxas.com"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-strong)]"
            >
              contacato@joyasabraxas.com
            </a>
            <a
              href="tel:+59898842100"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-line)] px-6 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            >
              +598 98 842 100
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
