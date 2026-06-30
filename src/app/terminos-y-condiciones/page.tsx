import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Abraxas Joyería",
  description: "Términos y condiciones de uso y condiciones generales de compra en Abraxas Joyería.",
  alternates: { canonical: "/terminos-y-condiciones" },
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="mx-auto max-w-[800px] px-6 py-16 text-[var(--color-muted)] leading-relaxed">
      <h1 className="mb-2 text-3xl font-light tracking-[0.18em] uppercase text-[var(--color-ink)]">
        Términos y Condiciones
      </h1>
      <p className="mb-10 text-xs tracking-widest uppercase">
        Última actualización: Junio de 2026
      </p>

      <div className="space-y-8 text-sm">
        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">1. Introducción</h2>
          <p>
            Te damos la bienvenida al sitio web de Abraxas Joyería. Al acceder a nuestra tienda y realizar compras en ella, aceptas regirte por los presentes Términos y Condiciones generales. Te recomendamos leerlos con atención antes de realizar un pedido.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">2. Productos y Variaciones</h2>
          <p>
            Nuestras piezas de joyería son elaboradas artesanalmente con metales nobles y piedras preciosas. Debido a la naturaleza artesanal de la orfebrería, puede haber ligeras variaciones de acabado o peso entre piezas de la misma colección, lo cual constituye una garantía de su autenticidad y carácter único.
          </p>
          <p className="mt-3">
            Para anillos y alianzas, el cliente es responsable de seleccionar la medida adecuada utilizando las opciones correspondientes de talle en la ficha de producto (con la ayuda de nuestra Guía de Talles).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">3. Precios y Moneda</h2>
          <p>
            Todos los precios publicados en nuestro sitio web están expresados en pesos uruguayos (UYU). Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso, garantizando que se aplicará el precio vigente al momento de la confirmación final de la compra.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">4. Métodos de Pago</h2>
          <p>
            Ofrecemos las siguientes modalidades para realizar tus pagos de forma segura:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li><strong>Mercado Pago:</strong> Permite abonar mediante tarjetas de crédito o débito (Visa, Mastercard, OCA, Diners, Lider) y redes de cobranza (Abitab, Redpagos) de acuerdo a las cuotas y promociones financieras vigentes de la plataforma.</li>
            <li><strong>Transferencia Bancaria Directa:</strong> A nuestra cuenta BROU (Banco República). En esta modalidad, es requisito enviar el comprobante de transferencia bancaria por WhatsApp o nuestro formulario de contacto en un plazo máximo de 24 horas hábiles para confirmar y reservar las piezas.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">5. Confirmación y Propiedad</h2>
          <p>
            La confirmación de la orden de compra quedará formalizada una vez que hayamos verificado la acreditación del pago. Abraxas Joyería se reserva el derecho de rechazar o cancelar cualquier pedido ante dudas de fraude, falta de disponibilidad de inventario o imposibilidad de procesar el pago correspondiente.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">6. Modificaciones de los Términos</h2>
          <p>
            Abraxas Joyería se reserva el derecho de modificar o actualizar estos Términos y Condiciones en cualquier momento para adaptarlos a novedades legislativas o comerciales. Las modificaciones serán válidas a partir de su publicación en este sitio web.
          </p>
        </section>
      </div>
    </main>
  );
}
