'use client';

const readCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// GA4's _ga cookie looks like "GA1.1.<id-part-1>.<id-part-2>" — the last two
// dot-segments together are the client_id the Measurement Protocol expects.
export const getGaClientId = () => {
  const raw = readCookie('_ga');
  if (!raw) return null;
  const parts = raw.split('.');
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : null;
};

// Fire an event to whichever tracking scripts are loaded (GA4 gtag, FB
// Pixel). Safe to call even when tracking is disabled/not yet loaded.
export const trackEvent = (name, params = {}) => {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
  if (typeof window.fbq === 'function') window.fbq('track', name, params);
};
