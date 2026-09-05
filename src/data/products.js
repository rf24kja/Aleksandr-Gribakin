/**
 * The owner's own products — a third kind of entry, deliberately apart.
 *
 * The site already keeps two lists that must never merge: `webProjects.js` is
 * work somebody paid for, `projects.js` describes a method. These are neither.
 * They are his: he decided what they are, he runs them, and unlike every client
 * on this page they can be opened in a new tab right now. That is a different
 * kind of proof and it gets a different section rather than being smuggled into
 * one of the other two.
 *
 * `status` is the same gate `webProjects.js` uses, and for the same reason. An
 * entry renders nowhere until a human who knows the product has written what it
 * does. Nothing here may be inferred from what a domain serves today: this site
 * runs paid advertising, and a guessed description of the owner's own business
 * is exactly the kind of claim the project's first rule exists to stop.
 *
 * `shot` names a file under public/products/. Take them with:
 *
 *   node scripts/product-shots.mjs
 *
 * which reads the URLs below, so the picture and the entry cannot drift apart.
 */

/** @typedef {'draft'|'published'} Status */

export const PRODUCTS = [
  {
    id: '24go-site',
    name: '24go.site',
    url: 'https://24go.site',
    status: 'draft',
    since: '',
    // What it is, in one line a stranger understands. Owner's words.
    tagline: { EN: '', RU: '' },
    // Two or three sentences: who it is for, and what it does for them.
    summary: { EN: '', RU: '' },
    // Exact, like every capacity line on this site.
    role: { EN: '', RU: '' },
    stack: [],
    shot: '24go-site.jpg',
  },
  {
    id: '24go-asia',
    name: '24go.asia',
    url: 'https://24go.asia',
    status: 'draft',
    since: '',
    tagline: { EN: '', RU: '' },
    summary: { EN: '', RU: '' },
    role: { EN: '', RU: '' },
    stack: [],
    shot: '24go-asia.jpg',
  },
];

/**
 * A draft is never publishable, and neither is an entry missing the copy that
 * makes it mean anything. Same shape of check as the client cases: the list is
 * the gate, so no renderer has to remember to apply one.
 */
const complete = (p) => p.status === 'published'
  && !!(p.tagline.EN && p.tagline.RU)
  && !!(p.summary.EN && p.summary.RU)
  && !!(p.role.EN && p.role.RU);

/** Publishable products, localised. Empty until someone fills the copy in. */
export function products(lang = 'EN') {
  const key = lang === 'RU' ? 'RU' : 'EN';
  return PRODUCTS.filter(complete).map((p) => ({
    id: p.id,
    name: p.name,
    url: p.url,
    since: p.since,
    tagline: p.tagline[key] || p.tagline.EN,
    summary: p.summary[key] || p.summary.EN,
    role: p.role[key] || p.role.EN,
    stack: p.stack,
    shot: p.shot ? `/products/${p.shot}` : null,
  }));
}

/** What each unpublishable entry is still missing — used by the shot script. */
export function incompleteProducts() {
  return PRODUCTS.filter((p) => !complete(p)).map((p) => {
    const missing = [];
    if (p.status !== 'published') missing.push('status: published');
    if (!p.tagline.EN || !p.tagline.RU) missing.push('tagline');
    if (!p.summary.EN || !p.summary.RU) missing.push('summary');
    if (!p.role.EN || !p.role.RU) missing.push('role');
    if (!p.since) missing.push('since');
    if (!p.stack.length) missing.push('stack');
    return { id: p.id, missing };
  });
}
