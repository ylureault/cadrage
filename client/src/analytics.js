// Mesure d'audience Google Analytics 4, seulement après accord explicite (recommandations CNIL).
// Rien n'est chargé ni déposé avant « Accepter ». Refuser est aussi simple qu'accepter.
// L'identifiant d'un cadrage vaut clé d'accès : il n'est jamais envoyé, toutes les pages deviennent /espace.

// Une instance auto-hébergée met VITE_GA_ID à vide (aucune mesure) ou à son propre identifiant
export const GA_ID = import.meta.env?.VITE_GA_ID ?? 'G-W57H67TD3N';
const KEY = 'insuffle-consent';
const DURATION = 182 * 86400000; // on redemande au bout de six mois

export function getConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    if (!c || Date.now() - c.at > DURATION) return null;
    return c.value; // 'granted' | 'denied'
  } catch { return null; }
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() })); } catch { /* stockage indisponible */ }
  if (value === 'granted') loadAnalytics();
  else disableAnalytics();
  window.dispatchEvent(new CustomEvent('insuffle:consent', { detail: value }));
}

export function openConsent() {
  window.dispatchEvent(new CustomEvent('insuffle:consent-open'));
}

// Une adresse sans l'identifiant du cadrage
export function safePath(pathname = window.location.pathname, hash = window.location.hash) {
  if (pathname === '/' || pathname === '') return '/';
  const view = (hash || '').replace(/^#/, '').split(/[?&]/)[0];
  return `/espace${view ? `/${view}` : ''}`;
}

let loaded = false;
function gtag() { window.dataLayer.push(arguments); } // eslint-disable-line prefer-rest-params

export function loadAnalytics() {
  if (loaded || !GA_ID || typeof window === 'undefined') return;
  loaded = true;
  window[`ga-disable-${GA_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
  gtag('js', new Date());
  gtag('config', GA_ID, {
    send_page_view: false,
    page_location: `${window.location.origin}${safePath()}`,
    page_referrer: document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined,
  });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  trackPage();
}

function disableAnalytics() {
  window[`ga-disable-${GA_ID}`] = true;
  if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
  // On retire les cookies _ga déjà posés, sur le domaine et ses parents
  const host = window.location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < host.length - 1; i++) domains.push(`; domain=.${host.slice(i).join('.')}`);
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
      for (const d of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
    }
  }
}

export function trackPage(path = safePath()) {
  if (!loaded || getConsent() !== 'granted') return;
  window.gtag('event', 'page_view', { page_location: `${window.location.origin}${path}`, page_path: path, page_title: document.title });
}

export function trackEvent(name, params = {}) {
  if (!loaded || getConsent() !== 'granted') return;
  window.gtag('event', name, params);
}

// Au démarrage : si l'accord a déjà été donné, on charge
export function initAnalytics() {
  if (getConsent() === 'granted') loadAnalytics();
}
