import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | Abraxas Joyería",
  description: "Políticas de envío en Uruguay, plazos de entrega y política de cambios y devoluciones de Abraxas Joyería.",
  alternates: { canonical: "/envios-y-devoluciones" },
};

export default function EnviosYDevolucionesPage() {
  return (
    <main className="mx-auto max-w-[800px] px-6 py-16 text-[var(--color-muted)] leading-relaxed">
      <h1 className="mb-2 text-3xl font-light tracking-[0.18em] uppercase text-[var(--color-ink)]">
        Envíos y Devoluciones
      </h1>
      <p className="mb-10 text-xs tracking-widest uppercase">
        Última actualización: Junio de 2026
      </p>

      <div className="space-y-8 text-sm">
        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">1. Métodos de Envío y Tiempos de Entrega</h2>
          <p>
            Realizamos envíos de todas nuestras piezas de joyería artesanal a todo el territorio de Uruguay bajo las siguientes condiciones:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2.5">
            <li>
              <strong>Montevideo:</strong>
              <ul className="mt-1 list-circle pl-5 space-y-1 text-xs">
                <li>Envíos por cadetería privada a domicilio: <strong>$200 a $400</strong> según la zona.</li>
                <li><strong>Envío GRATIS</strong> en compras mayores a <strong>$3.000</strong> con entrega en un plazo máximo de <strong>24 horas</strong>.</li>
              </ul>
            </li>
            <li>
              <strong>Interior del país:</strong>
              <ul className="mt-1 list-circle pl-5 space-y-1 text-xs">
                <li>Despachados a través de DAC con un costo de envío de <strong>$280</strong>.</li>
                <li>El despacho en Tres Cruces se realiza <strong>sin costo</strong> en un plazo máximo de <strong>48 horas</strong>.</li>
                <li><strong>Envío GRATIS</strong> (costo de envío cubierto) en compras mayores a <strong>$3.000</strong>.</li>
              </ul>
            </li>
          </ul>
          <p className="mt-3 text-xs italic text-[var(--color-muted)]">
            * Importante: Si la pieza es por encargo o requiere fabricación personalizada, los plazos de envío comenzarán a regir a partir de que la pieza esté completamente terminada por nuestro taller.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">2. Seguimiento del Envío</h2>
          <p>
            Una vez despachado el pedido, te enviaremos por correo electrónico o WhatsApp el número de rastreo (tracking) y la confirmación de la agencia de envíos para que puedas seguir el estado de tu paquete en tiempo real.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">3. Política de Cambios y Devoluciones</h2>
          <p>
            Queremos que te encante tu joya Abraxas. Si por alguna razón no estás conforme con tu compra, dispones de un plazo de <strong>30 días corridos</strong> desde la fecha de recepción para solicitar un cambio.
          </p>
          <p className="mt-3">
            Para poder efectuar un cambio, se deben cumplir los siguientes requisitos:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>El artículo debe estar sin uso, en perfectas condiciones y en su estuche/empaque original.</li>
            <li>Se debe presentar el comprobante de compra digital o número de orden respectivo.</li>
            <li>Los costos de envío asociados a la devolución y nuevo despacho para cambios corren por cuenta del cliente, salvo en casos de fallas de fabricación.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">4. Piezas Personalizadas o Grabadas</h2>
          <p>
            Ten en cuenta que aquellas piezas fabricadas a medida, grabadas de forma personalizada o con especificaciones exclusivas indicadas por el cliente no admiten cambios ni devoluciones, excepto en caso de errores de manufacturación por nuestra parte.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">5. Procedimiento para Cambios</h2>
          <p>
            Para iniciar el proceso de cambio de una pieza, ponte en contacto con nosotros escribiéndonos por WhatsApp o rellenando el formulario de contacto con tu nombre, número de pedido y el motivo del cambio. Te guiaremos paso a paso para coordinar la entrega o el despacho.
          </p>
        </section>
      </div>
    </main>
  );
}
