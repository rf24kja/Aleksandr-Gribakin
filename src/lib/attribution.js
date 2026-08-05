/**
 * Where the visitor came from, remembered until they write.
 *
 * This has to be read the moment the page opens and not when the form is sent.
 * The app rewrites the address with `replaceState` as soon as it resolves a
 * route, and the first hash change replaces it again — by the time someone has
 * read the page and filled in the form, `?utm_campaign=…` is long gone. An
 * enquiry that arrives with no idea which advert produced it is the same as no
 * measurement at all, which is the situation this exists to end.
 *
 * Deliberately not a cookie and not persistent: sessionStorage, so it lives for
 * the visit and disappears with the tab. Nothing here identifies a person —
 * these are the campaign labels the advert itself put in the link.
 */

const KEY = 'attribution';
const MAX = 120;

// Campaign parameters, plus the click ids Yandex and Google append themselves.
const PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'yclid', 'gclid', 'fbclid',
];

// sessionStorage throws in private mode on some browsers, so it is a cache
// rather than the source of truth.
let memory = null;

function read() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* private mode */ }
  return memory;
}

function write(value) {
  memory = value;
  try { sessionStorage.setItem(KEY, JSON.stringify(value)); } catch { /* private mode */ }
}

/**
 * Records the arrival. Safe to call more than once — only the first arrival
 * that carried a campaign is kept.
 *
 * The exception is a visit that started without one: someone who lands from a
 * search, wanders off, and comes back through an advert in the same tab should
 * be credited to the advert, because otherwise the campaign that actually paid
 * for the enquiry is the one label missing from it.
 */
export function captureAttribution() {
  const query = new URLSearchParams(window.location.search);
  const found = {};
  for (const key of PARAMS) {
    const value = query.get(key);
    if (value) found[key] = value.slice(0, MAX);
  }

  const existing = read();
  if (existing && (!Object.keys(found).length || existing.utm_source || existing.yclid || existing.gclid)) {
    return;
  }

  const referrer = document.referrer;
  if (referrer && !referrer.startsWith(window.location.origin)) {
    found.referrer = referrer.slice(0, MAX);
  }
  found.landing = `${window.location.pathname}${window.location.search}`.slice(0, MAX);
  write(found);
}

/** What to attach to an enquiry. Always an object, empty if nothing is known. */
export function attribution() {
  return read() || {};
}
