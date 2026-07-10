import { CheckCircle2, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const FREE_SHIPPING_THRESHOLD = 3000;

export default function ShippingProgress({ total }: { total: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - total;
  const qualifies = remaining <= 0;

  return (
    <div
      className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
        qualifies ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
      }`}
    >
      {qualifies ? (
        <CheckCircle2 size={15} className="shrink-0" />
      ) : (
        <AlertTriangle size={15} className="shrink-0" />
      )}
      <span>
        {qualifies
          ? "Envío gratis obtenido"
          : `Te faltan ${formatPrice(remaining)} para obtener el envío gratuito`}
      </span>
    </div>
  );
}
