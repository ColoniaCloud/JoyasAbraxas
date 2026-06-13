"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 + Meta (Facebook/Instagram) Pixel.
 * No renderiza nada si las variables de entorno no están definidas, así que
 * es seguro dejarlo siempre montado: se activa al cargar los IDs.
 * El primer pageview lo dispara el snippet inline; las navegaciones internas
 * (App Router, sin recarga) las reporta el efecto de abajo.
 */
export default function Analytics() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return; // el pageview inicial ya lo envían los snippets inline
    }
    const url = window.location.origin + pathname;
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: url,
    });
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {FB_PIXEL_ID && (
        <Script id="fb-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );
}
