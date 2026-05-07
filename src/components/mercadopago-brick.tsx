"use client";

import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

interface Props {
  amount: number;
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
  onError?: (error: unknown) => void;
}

export default function MercadoPagoBrick({ amount, onSubmit, onError }: Props) {
  return (
    <Payment
      initialization={{ amount }}
      customization={{
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
          ticket: "all",
        },
        visual: {
          style: {
            theme: "dark",
          },
        },
      }}
      onSubmit={async ({ formData }) => {
        await onSubmit(formData as unknown as Record<string, unknown>);
      }}
      onError={onError}
    />
  );
}
