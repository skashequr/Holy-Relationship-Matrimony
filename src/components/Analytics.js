'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { settingsAPI } from '@/lib/api';

/**
 * Loads Google Analytics (GA4) and Facebook Pixel using IDs configured from
 * the admin dashboard (Settings → ট্র্যাকিং), instead of hardcoding them here.
 * Renders nothing until the config is fetched; renders nothing at all if
 * tracking is disabled or no IDs are set.
 */
export default function Analytics() {
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    settingsAPI.getTracking()
      .then(({ data }) => setTracking(data.tracking || {}))
      .catch(() => setTracking({}));
  }, []);

  if (!tracking) return null;
  const { gaMeasurementId, fbPixelId } = tracking;

  return (
    <>
      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      )}
      {fbPixelId && (
        <Script id="fb-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
