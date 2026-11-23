/**
 * Decoración de Fiestas: se enciende sola entre `start` y `end` (hora de Uruguay).
 * Para previsualizar o apagarla a mano: NEXT_PUBLIC_SEASON=on | off | auto (por defecto).
 * En los previews de Vercel (VERCEL_ENV=preview) está encendida salvo que se indique otra cosa.
 * El chequeo corre al renderizar en el servidor; las páginas con caché pueden tardar
 * su ventana de revalidate (≤ 1 h) en prender o apagar.
 */
export const SEASON = {
  start: "2026-12-01T00:00:00-03:00",
  end: "2027-01-06T23:59:59-03:00",
};

export function isSeasonActive(now: Date = new Date()): boolean {
  // En los previews de Vercel se muestra siempre, para poder revisarla antes de la fecha.
  const mode =
    process.env.NEXT_PUBLIC_SEASON ?? (process.env.VERCEL_ENV === "preview" ? "on" : "auto");
  if (mode === "on") return true;
  if (mode === "off") return false;
  const t = now.getTime();
  return t >= Date.parse(SEASON.start) && t <= Date.parse(SEASON.end);
}
