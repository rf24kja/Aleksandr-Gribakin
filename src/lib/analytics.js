/**
 * Every counter on the site, behind one door.
 *
 * There are three of them — Yandex.Metrica, GA4 and Vercel — and left to
 * themselves they would each answer "how many pageviews?" differently. This is
 * a single-page site: opening a project, switching to the terminal and coming
 * back never reloads anything, so a pageview is whatever we decide to report.
 * Both Metrica and GA4 are therefore started with their own automatic pageview
 * switched off and fed from one function, so their numbers describe the same
 * events rather than three definitions of a visit. Vercel is the exception and
 * is documented where it is loaded.
 *
 * Nothing here runs when an id is missing, so an unconfigured build ships the
 * site exactly as it was before analytics existed.
 *
 * The ids come from meta tags in index.html rather than from a module: they are
 * public identifiers, every site that uses them exposes them in its page
 * source, and keeping them in the markup means changing a counter is an edit to
 * one visible line instead of a hunt through the bundle.
 */

const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content?.trim() || '';
const YM_ID = () => meta('yandex-metrica');
const GA_ID = () => meta('google-analytics');

let started = false;
let lastUrl = '';

/** Path, query and hash — everything that distinguishes one view from another. */
function currentUrl() {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
}

const absolute = (url) => window.location.origin + url;

function script(src) {
  const el = document.createElement('script');
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
  return el;
}

function loadMetrica(id) {
  // The stub queues calls made before tag.js arrives, so nothing is lost in the
  // window between the first pageview and the network.
  window.ym = window.ym || function ym(...args) { (window.ym.a = window.ym.a || []).push(args); };
  window.ym.l = Date.now();
  script('https://mc.yandex.ru/metrika/tag.js');
  window.ym(id, 'init', {
    defer: true, // trackPage() is the only thing that reports a view
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
}

function loadGA(id) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
}

/**
 * Vercel counts on its own and is left to.
 *
 * Its script is served from this origin, which is the point of it: ad blockers
 * that drop the other two leave it alone, so the gap between its number and
 * Metrica's is a measurement in itself. It follows path changes rather than the
 * hash routes the other two are told about, so it will always read a little
 * lower — that is the trade, not a fault.
 *
 * There is no id to configure, only a toggle in the Vercel project, and while
 * that toggle is off this is a 404 in the console — nothing a visitor sees, but
 * it is there until the toggle is on. Asking whether the file exists before
 * requesting it was tried and dropped: the probe logs the same 404 and costs an
 * extra request on every load, so it bought nothing.
 */
function loadVercel() {
  window.va = window.va || function va(...args) { (window.vaq = window.vaq || []).push(args); };
  script('/_vercel/insights/script.js');
}

/**
 * Reports one view. Repeat calls for the same address do nothing: the app
 * rewrites the URL with replaceState when it resolves a prerendered page, which
 * would otherwise be counted as a second visit to the page already open.
 */
export function trackPage(url = currentUrl()) {
  if (url === lastUrl) return;
  const referrer = lastUrl ? absolute(lastUrl) : document.referrer;
  lastUrl = url;
  const title = document.title;
  const ym = YM_ID();
  const ga = GA_ID();
  if (ym && window.ym) window.ym(ym, 'hit', absolute(url), { title, referer: referrer });
  if (ga && window.gtag) {
    window.gtag('event', 'page_view', { page_location: absolute(url), page_title: title });
  }
}

/**
 * Reports something worth counting — a sent enquiry, a mode switch.
 *
 * `name` is the goal identifier in Metrica and the event name in GA4, so keep
 * it lowercase with underscores: both accept that, and matching names are what
 * make the two dashboards comparable.
 */
export function trackEvent(name, params = {}) {
  const ym = YM_ID();
  const ga = GA_ID();
  if (ym && window.ym) window.ym(ym, 'reachGoal', name, params);
  if (ga && window.gtag) window.gtag('event', name, params);
  if (window.va) window.va('event', { name, data: params });
}

function wireRouteChanges() {
  const send = () => trackPage();
  window.addEventListener('hashchange', send);
  window.addEventListener('popstate', send);
  // Neither pushState nor replaceState fires an event, and both are how this
  // app navigates — a project opened from a card never touches the hash.
  for (const name of ['pushState', 'replaceState']) {
    const original = history[name].bind(history);
    history[name] = (...args) => { original(...args); send(); };
  }
  // Which interface a visitor actually chooses is the one thing this site can
  // learn that a normal portfolio cannot.
  document.addEventListener('mode:change', (e) => {
    trackEvent('mode_switch', { mode: e.detail?.to });
  });
}

/**
 * Starts everything, once.
 *
 * After the first frame rather than after `load`: waiting for the whole page
 * would lose exactly the visitors worth knowing about — someone who leaves an
 * ad click in two seconds — while a counter that competes with the first paint
 * makes the site slower for everyone. One frame costs nothing either way.
 */
export function initAnalytics() {
  if (started) return;
  started = true;
  const start = () => {
    const ym = YM_ID();
    const ga = GA_ID();
    if (ym) loadMetrica(ym);
    if (ga) loadGA(ga);
    loadVercel();
    trackPage();
    wireRouteChanges();
  };
  requestAnimationFrame(() => requestAnimationFrame(start));
}
