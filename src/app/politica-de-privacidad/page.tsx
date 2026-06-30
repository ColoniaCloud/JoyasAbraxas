import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Abraxas Joyería",
  description: "Política de privacidad y protección de datos personales de Abraxas Joyería en Uruguay.",
  alternates: { canonical: "/politica-de-privacidad" },
};

export default function PoliticaDePrivacidadPage() {
  return (
    <main className="mx-auto max-w-[800px] px-6 py-16 text-[var(--color-muted)] leading-relaxed">
      <h1 className="mb-2 text-3xl font-light tracking-[0.18em] uppercase text-[var(--color-ink)]">
        Política de Privacidad
      </h1>
      <p className="mb-10 text-xs tracking-widest uppercase">
        Última actualización: Junio de 2026
      </p>

      <div className="space-y-8 text-sm">
        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">1. Información que Recopilamos</h2>
          <p>
            En Abraxas Joyería, la privacidad de nuestros clientes es de máxima importancia. Recopilamos información personal básica cuando interactúas con nosotros, te registras en nuestro sitio, realizas una compra o te suscribes a nuestro newsletter. Esta información incluye:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Datos de contacto: Nombre, dirección de correo electrónico y número de teléfono.</li>
            <li>Datos de envío: Dirección de entrega y detalles para la logística del pedido.</li>
            <li>Datos de facturación: Detalles requeridos para emitir comprobantes legales de compra.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">2. Uso de la Información</h2>
          <p>
            Utilizamos los datos recopilados con las siguientes finalidades:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Procesar, gestionar y enviar los pedidos de joyería que adquieras en nuestra tienda.</li>
            <li>Responder a tus consultas de soporte y atención a través de canales como WhatsApp y nuestro formulario de contacto.</li>
            <li>Enviar boletines informativos y ofertas exclusivas, siempre que hayas dado tu consentimiento explícito para suscribirte.</li>
            <li>Optimizar y personalizar tu experiencia de navegación en nuestro sitio web.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">3. Servicios de Terceros y Transacciones</h2>
          <p>
            Para garantizar la seguridad de tus transacciones y ofrecer la mejor experiencia, colaboramos con proveedores de servicios de confianza:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li><strong>Procesamiento de Pagos:</strong> Los pagos electrónicos se procesan de forma segura a través de <strong>Mercado Pago</strong>. Abraxas Joyería no almacena ni tiene acceso a los datos de tus tarjetas de crédito o débito.</li>
            <li><strong>Transferencias Bancarias:</strong> La información provista para transferencias bancarias directas (BROU) es tratada de forma estrictamente confidencial.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">4. Cookies y Tecnologías de Seguimiento</h2>
          <p>
            Utilizamos cookies y tecnologías de seguimiento similares para analizar el tráfico de nuestro sitio web y optimizar nuestras campañas publicitarias en plataformas de terceros:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li><strong>Google Analytics 4 (GA4):</strong> Analiza la navegación de los usuarios de forma anónima para ayudarnos a entender el rendimiento del sitio.</li>
            <li><strong>Meta Pixel (Facebook/Instagram):</strong> Mide la efectividad de nuestra publicidad y nos permite mostrar anuncios relevantes basados en tus visitas anteriores.</li>
          </ul>
          <p className="mt-3">
            Puedes configurar tu navegador para rechazar las cookies, aunque esto podría limitar el correcto funcionamiento de algunas secciones de la tienda.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">5. Seguridad de los Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra accesos no autorizados, pérdidas o alteraciones. El sitio web utiliza protocolos de cifrado seguros (SSL/HTTPS) en todas sus páginas para resguardar la comunicación de datos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-[var(--color-ink)]">6. Tus Derechos</h2>
          <p>
            Tienes derecho a acceder, rectificar, actualizar o solicitar la eliminación de tu información personal de nuestras bases de datos en cualquier momento. Para ejercer estos derechos o realizar cualquier consulta relacionada con nuestra política de privacidad, puedes contactarnos a través de nuestro formulario de contacto o escribirnos directamente a nuestro número de atención al cliente.
          </p>
        </section>
      </div>
    </main>
  );
}
