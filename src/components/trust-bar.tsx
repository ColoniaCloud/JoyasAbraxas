import { Truck, ShieldCheck, MessageCircle, Gem } from "lucide-react";

const ITEMS = [
  {
    icon: Truck,
    title: "Envíos a todo el país",
    subtitle: "Llegamos a todo Uruguay",
  },
  {
    icon: ShieldCheck,
    title: "Pago seguro",
    subtitle: "MercadoPago y transferencia",
  },
  {
    icon: MessageCircle,
    title: "Atención personalizada",
    subtitle: "Te asesoramos por WhatsApp",
  },
  {
    icon: Gem,
    title: "Joyería artesanal",
    subtitle: "Piezas hechas con dedicación",
  },
];

export default function TrustBar() {
  return (
    <section
      aria-label="Beneficios"
      className="border-t border-[var(--color-line)] bg-[var(--color-panel)]/40"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-6 px-6 py-8 md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3">
            <Icon
              size={26}
              strokeWidth={1.4}
              className="shrink-0 text-[var(--color-brand)]"
            />
            <div className="leading-tight">
              <p className="m-0 text-sm font-semibold text-[var(--color-ink)]">
                {title}
              </p>
              <p className="m-0 text-xs text-[var(--color-muted)]">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
