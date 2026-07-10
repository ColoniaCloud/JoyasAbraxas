import Image from "next/image";

/** Bloque visual compartido: texto sobre fondo rosa + foto. Usado por el modal y por el banner. */
export default function PromoBannerContent({ priority = false }: { priority?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      {/* Texto sobre fondo rosa */}
      <div className="flex flex-col justify-center gap-4 bg-[var(--color-brand)] p-7 sm:p-9">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
          Beneficios Abraxas
        </p>

        <div>
          <p className="font-heading m-0 text-[3rem] font-bold leading-[0.9] text-white">
            10<span className="align-top text-2xl font-light">%</span>
          </p>
          <p className="m-0 mt-1 text-lg font-light tracking-wide text-white">
            OFF pagando con <span className="font-semibold">transferencia bancaria</span>
          </p>
        </div>

        <div className="h-px w-10 bg-white/40" />

        <div>
          <p className="font-heading m-0 text-2xl font-semibold leading-tight text-white">
            Envíos gratis
          </p>
          <p className="m-0 mt-1 text-sm font-light text-white/90">
            a todo el país en compras mayores a <span className="font-semibold">$3000</span>
          </p>
        </div>
      </div>

      {/* Foto */}
      <div className="relative h-48 sm:h-auto">
        <Image
          src="/ornament/slider/anillos2.jpg"
          alt="Anillos Abraxas"
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
