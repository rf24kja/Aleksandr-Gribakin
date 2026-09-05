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
 * Two lengths, deliberately. `tagline` is the whole of what a card shows
 * before anyone clicks: one line, no clauses, the thing itself. `summary` is
 * what opens behind "More" — who it is for and what it does for them. A card
 * that leads with a paragraph is a card nobody finishes, and this section sits
 * above everything else on the page.
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
    status: 'published',
    since: '',
    tagline: {
      EN: 'Finds customers in Telegram chats and answers them for you',
      RU: 'Находит клиентов в чатах Telegram и отвечает им за вас',
    },
    summary: {
      EN: 'A sales tool for companies whose customers talk in messengers. It watches the groups they talk in, works out which messages are somebody actually looking to buy rather than chatting, and hands those to the sales team sorted by how ready they are — with a reply sent while the person is still in the conversation, and an export into whatever CRM the company already runs.',
      RU: 'Инструмент продаж для компаний, чьи клиенты общаются в мессенджерах. Он следит за группами, где они общаются, отличает сообщение человека, который правда хочет купить, от просто разговора и отдаёт такие обращения отделу продаж, разобранными по готовности — с ответом, отправленным, пока человек ещё в переписке, и выгрузкой в ту CRM, которой компания уже пользуется.',
    },
    role: {
      EN: 'My own product — built and run by me',
      RU: 'Собственный продукт — разработка и эксплуатация',
    },
    stack: [],
    shot: '24go-site.jpg',
  },
  {
    id: '24go-asia',
    name: '24go.asia',
    url: 'https://24go.asia',
    status: 'published',
    since: '',
    tagline: {
      EN: 'Phuket villas, straight from the owner',
      RU: 'Виллы на Пхукете напрямую от собственника',
    },
    summary: {
      EN: 'A collection of houses across the districts of Phuket, each one visited in person before it is listed — the paperwork, the water, the electricity, how quiet it actually is — and photographed rather than illustrated with stock images. A visitor filters by district, price and bedrooms, and the enquiry reaches the owner instead of a chain of intermediaries.',
      RU: 'Подборка домов по районам Пхукета: каждый осмотрен лично до того, как попасть в каталог, — документы, вода, электричество, действительно ли там тихо, — и отснят, а не проиллюстрирован стоковыми картинками. Посетитель отбирает по району, цене и числу спален, а заявка уходит собственнику, а не по цепочке посредников.',
    },
    role: {
      EN: 'My own product — built and run by me',
      RU: 'Собственный продукт — разработка и эксплуатация',
    },
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
