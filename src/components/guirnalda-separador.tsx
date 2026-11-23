import { guirnaldaJoyeroSvg, VARIANTES_JOYERO } from "@/lib/guirnalda-joyero";

// Ids propios para no repetir los degradés de la guirnalda del header.
const SVG_ESCRITORIO = guirnaldaJoyeroSvg({
  ...VARIANTES_JOYERO.escritorio,
  id: "gj-sep-d",
  alto: 200,
  claseEstrella: "gj-estrella",
});
const SVG_CELULAR = guirnaldaJoyeroSvg({
  ...VARIANTES_JOYERO.celular,
  id: "gj-sep-m",
  alto: 150,
  claseEstrella: "gj-estrella",
});

/** Guirnalda «Joyero» entera usada como separador entre secciones. Decorativa. */
export default function GuirnaldaSeparador() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative -mb-6 w-full select-none">
      <div className="hidden md:block [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: SVG_ESCRITORIO }} />
      <div className="md:hidden [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: SVG_CELULAR }} />
    </div>
  );
}
