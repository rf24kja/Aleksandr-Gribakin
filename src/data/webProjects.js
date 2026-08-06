/**
 * Commercial web projects — work done for real, named clients.
 *
 * Deliberately a separate file from projects.js, because these are a different
 * kind of claim. The seventeen entries there are reference architectures: how a
 * class of problem gets solved, written by the author about his own method.
 * These are jobs done for other companies, and every line is checkable by
 * anyone who cares to check. A visitor who reads both as the same thing is the
 * reason the site felt like an empty report, so the two never share a list.
 *
 * `status` is the safety catch. An entry stays `draft` until the facts behind
 * it come from the person who did the work — period, capacity, what they
 * personally did, and whether the client may be named. Nothing draft is ever
 * rendered, listed, prerendered or counted: with no published entries the site
 * looks exactly as it did before this file existed. That is on purpose. The
 * alternative — writing plausible copy from what the client's website looks
 * like today — is fabrication, and it would be aimed at third parties while
 * the site is running paid advertising.
 *
 * What is filled in below was measured from the live sites, not assumed:
 * sector, and `observed` (the platform serving that domain today). `observed`
 * is a note to whoever writes the case, never shown to a visitor — what runs
 * there now is frequently not what the work was.
 */

/** @typedef {'draft'|'published'} Status */

export const WEB_PROJECTS = [
  {
    id: 'engelvoelkers',
    client: 'Engel & Völkers',
    url: 'https://www.engelvoelkers.com',
    status: 'draft',
    sector: { EN: 'Luxury real estate, global', RU: 'Люксовая недвижимость, глобально' },
    observed: 'Next.js behind Cloudflare — a modern rebuild',
  },
  {
    id: 'sixt',
    client: 'Sixt',
    url: 'https://www.sixt.com',
    status: 'draft',
    sector: { EN: 'Car rental, international', RU: 'Прокат автомобилей, международный' },
    observed: 'Behind a WAF — no signals available',
  },
  {
    id: '99acres',
    client: '99acres',
    url: 'https://www.99acres.com',
    status: 'draft',
    sector: { EN: 'Property portal, India', RU: 'Портал недвижимости, Индия' },
    observed: 'Behind a WAF — no signals available',
  },
  {
    id: 'locabens',
    client: 'Locabens',
    url: 'https://www.locabens.com.br',
    status: 'draft',
    sector: {
      EN: 'Tower crane and hoist rental, Brazil',
      RU: 'Аренда башенных кранов и подъёмников, Бразилия',
    },
    observed: 'WordPress 6.4.8 / PHP 8.1 / LiteSpeed; pt-BR, en, es',
  },
  {
    id: 'tzuchi',
    client: 'Tzu Chi Foundation Singapore',
    url: 'https://www.tzuchi.org.sg',
    status: 'draft',
    sector: { EN: 'Charitable foundation, Singapore', RU: 'Благотворительный фонд, Сингапур' },
    observed: 'SilverStripe CMS on Apache; en-sg and zh-sg',
  },
  {
    id: 'beyond-pl',
    client: 'Beyond.pl',
    url: 'https://www.beyond.pl',
    status: 'draft',
    sector: {
      EN: 'Data centre and cloud, now GPU-as-a-service',
      RU: 'ЦОД и облако, сегодня GPUaaS',
    },
    observed: 'WordPress; pl and en',
  },
  {
    id: '33rdcompany',
    client: 'Thirty Third Company',
    url: 'https://www.33rdcompany.org',
    status: 'draft',
    sector: { EN: 'Property management, USA', RU: 'Управление недвижимостью, США' },
    observed: 'Squarespace today — whatever was built has since been replaced',
  },
  {
    id: 'properstar',
    client: 'Properstar',
    url: 'https://www.properstar.com',
    status: 'draft',
    sector: { EN: 'Global property search', RU: 'Глобальный поиск недвижимости' },
    observed: 'Behind Azure WAF — no signals available',
  },
  {
    id: 'merchantwest',
    client: 'Merchant West',
    url: 'https://merchantwest.co.za',
    status: 'draft',
    sector: { EN: 'Financial services, South Africa', RU: 'Финансовые услуги, ЮАР' },
    observed: 'WordPress + Google Site Kit',
  },
  {
    id: 'creditafricainvest',
    client: 'Credit Africa Invest',
    url: 'https://creditafricainvest.com',
    status: 'draft',
    sector: { EN: 'Lending', RU: 'Кредитование' },
    observed: 'WordPress',
  },
];

/**
 * The shape a published entry has to fill in. Kept here rather than in a README
 * so it sits next to the data it describes.
 *
 *   period    '2019–2021'
 *   capacity  how the work was engaged: staff, contractor, agency, subcontract.
 *             This decides the wording, and precise wording is what protects
 *             the claim — "as part of a contractor's team" and "built the site"
 *             are different statements about someone else's company.
 *   publicName  false when the client may not be named; the sector is shown
 *               instead and the case loses nothing.
 *   stack     string[]
 *   case      per-locale { situation, work, outcome, evidence }
 *             evidence is allowed to say plainly that there is none.
 */
const REQUIRED = ['period', 'capacity', 'stack', 'case'];

/** True when an entry carries enough to be shown without inventing anything. */
export function isPublishable(entry) {
  if (!entry || entry.status !== 'published') return false;
  return REQUIRED.every((key) => {
    const value = entry[key];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });
}

/**
 * Render-ready client projects for one locale — an empty array while the facts
 * are outstanding, which is what keeps every mode quiet.
 */
export function webProjects(lang = 'EN') {
  const key = lang === 'RU' ? 'RU' : 'EN';
  return WEB_PROJECTS.filter(isPublishable).map((p) => ({
    id: p.id,
    url: p.url,
    // A client that may not be named is described by what they do instead.
    name: p.publicName === false ? p.sector[key] : p.client,
    sector: p.sector[key],
    named: p.publicName !== false,
    period: p.period,
    capacity: p.capacity,
    stack: p.stack || [],
    ...(p.case?.[key] || p.case?.EN || {}),
  }));
}

/** How many are ready. Used to decide whether a section exists at all. */
export function webProjectCount() {
  return WEB_PROJECTS.filter(isPublishable).length;
}
