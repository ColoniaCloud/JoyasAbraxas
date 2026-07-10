"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import PromoBannerContent from "./promo-banner-content";

const SESSION_KEY = "abraxas_promo_modal_shown";
const SHOW_DELAY_MS = 2000;

function isTargetPath(pathname: string) {
  return pathname.startsWith("/categorias") || pathname.startsWith("/productos");
}

export default function PromoModal() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (!isTargetPath(pathname)) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      dialogRef.current?.showModal();
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="w-[90%] max-w-[480px] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm focus:outline-none sm:max-w-[640px]"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        margin: 0,
      }}
    >
      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        aria-label="Cerrar"
        className="absolute right-3 top-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
      >
        <X size={16} />
      </button>

      <PromoBannerContent priority />
    </dialog>
  );
}
