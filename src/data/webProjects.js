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
 * Everything in `case` came from the author, who did the work. Nothing here was
 * written from what a client's homepage looks like today — that would be
 * fabrication aimed at third parties, on a site running paid advertising.
 * `status` is the catch that enforced it: an entry renders nowhere until the
 * period, the capacity and the copy are all present.
 *
 * Two fields are mine rather than his:
 *   sector    what the business does, read off the live site.
 *   stack     the platform each domain serves today. Absent for the three that
 *             sit behind a WAF and give up nothing — a missing stack is honest,
 *             a guessed one is not. It describes the site now, which is not
 *             always what the work was.
 *
 * `url` is held for reference and never rendered: the author asked for the
 * companies to be named without linking to them.
 */

/** @typedef {'draft'|'published'} Status */

const SOLO = { EN: 'Fullstack developer, solo', RU: 'Fullstack-разработчик, соло' };

/**
 * The standing evidence line. These were contracts: there is no public
 * repository to point at and no dashboard to open, and the figures are the
 * clients' own. Saying so is worth more than implying a measurement nobody can
 * reproduce — and it is the honest answer to the question a reader is entitled
 * to ask.
 */
const UNDER_CONTRACT = {
  EN: 'Delivered under contract. The source and the internal measurements stay with the client, and the figure above is theirs rather than a public benchmark.',
  RU: 'Работа по договору с заказчиком. Исходный код и внутренние замеры остаются у него, и цифра выше — его, а не публичный бенчмарк.',
};

export const WEB_PROJECTS = [
  {
    id: 'engelvoelkers',
    client: 'Engel & Völkers',
    url: 'https://www.engelvoelkers.com',
    status: 'published',
    period: '2023',
    capacity: SOLO,
    stack: ['Next.js', 'React'],
    sector: { EN: 'Luxury real estate, global', RU: 'Люксовая недвижимость, глобально' },
    observed: 'Next.js behind Cloudflare',
    case: {
      EN: {
        situation: 'A luxury listing lives on its media: galleries, floor plans, commissioned photography. The same files that sell the property are what make the page slow.',
        work: 'Built the catalogue front end and back end — media galleries, filtering by location, an interactive map — and took the weight out of the media path with lazy loading and WebP.',
        outcome: 'Listings are browsed deeper: visitors go further into the catalogue instead of leaving on the first heavy page.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Элитный объект продаётся медиа: галереями, планировками, съёмкой. Те же файлы, что продают, и тормозят страницу.',
        work: 'Разработал интерфейс и бэкенд каталога — медиагалереи, фильтрация по локациям, интерактивная карта — и разгрузил отдачу медиа: отложенная загрузка и WebP.',
        outcome: 'Листинги стали смотреть глубже: посетитель уходит дальше по каталогу, а не закрывает первую тяжёлую страницу.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: 'sixt',
    client: 'Sixt',
    url: 'https://www.sixt.com',
    status: 'published',
    period: '2022',
    capacity: SOLO,
    sector: { EN: 'Car rental, international', RU: 'Прокат автомобилей, международный' },
    observed: 'Behind a WAF — no platform signals available',
    case: {
      EN: {
        situation: 'Booking is the whole reason anyone opens a rental site: a location, a pair of dates, a class of car, and a payment that has to go through the first time.',
        work: 'Designed and built the online booking module — search by location, dates and vehicle class — with payment gateway integration.',
        outcome: 'The module holds through the holiday peak, when a rental site takes its year in a few weeks.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Бронирование — то, ради чего вообще открывают сайт проката: локация, даты, класс авто и оплата, которая должна пройти с первого раза.',
        work: 'Спроектировал и реализовал модуль онлайн-бронирования — поиск по локациям, датам и классам авто — с интеграцией платёжных шлюзов.',
        outcome: 'Модуль держит пиковый сезон отпусков, когда прокат зарабатывает год за несколько недель.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: '99acres',
    client: '99acres',
    url: 'https://www.99acres.com',
    status: 'published',
    period: '2021',
    capacity: SOLO,
    sector: { EN: 'Property portal, India', RU: 'Портал недвижимости, Индия' },
    observed: 'Behind a WAF — no platform signals available',
    case: {
      EN: {
        situation: 'A property portal lives on the size of its catalogue, and is read mostly on a phone, often on a connection that cannot afford a heavy page.',
        work: 'Built the portal: geo search and multi-criteria filtering across a large body of listings.',
        outcome: 'Filters answer immediately over that volume, and the interface is built for a weak mobile connection rather than an office one.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Портал недвижимости живёт объёмом каталога, а смотрят его в основном с телефона и часто на связи, которая тяжёлой страницы не выдержит.',
        work: 'Разработал портал: GEO-поиск и многокритериальная фильтрация по большому массиву объектов.',
        outcome: 'Фильтры отвечают мгновенно на таком объёме, а интерфейс рассчитан на слабый мобильный интернет, а не на офисный.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: 'locabens',
    client: 'Locabens',
    url: 'https://www.locabens.com.br',
    status: 'published',
    period: '2021',
    capacity: SOLO,
    stack: ['WordPress', 'PHP'],
    sector: {
      EN: 'Tower crane and hoist rental, Brazil',
      RU: 'Аренда башенных кранов и подъёмников, Бразилия',
    },
    observed: 'WordPress 6.4.8 / PHP 8.1 / LiteSpeed; pt-BR, en, es',
    case: {
      EN: {
        situation: 'Heavy plant was rented without a working shop window: to match a machine to a job, or to get a price, you had to go through a manager.',
        work: 'Designed and built the rental catalogue from scratch — filtering by equipment specification and an interactive cost calculator — and made it work on a phone, because enquiries come from the site rather than the office.',
        outcome: 'Enquiry conversion up 35%.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Технику сдавали без работающей витрины: подобрать машину под задачу или узнать цену можно было только через менеджера.',
        work: 'С нуля спроектировал и разработал каталог аренды — фильтрация по параметрам оборудования и интерактивный калькулятор стоимости — и сделал его пригодным для телефона: заявки приходят со стройки, а не из офиса.',
        outcome: 'Конверсия в заявку выросла на 35%.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: 'tzuchi',
    client: 'Tzu Chi Foundation Singapore',
    url: 'https://www.tzuchi.org.sg',
    status: 'published',
    period: '2022',
    capacity: SOLO,
    stack: ['SilverStripe', 'PHP'],
    sector: { EN: 'Charitable foundation, Singapore', RU: 'Благотворительный фонд, Сингапур' },
    observed: 'SilverStripe CMS on Apache; en-sg and zh-sg',
    case: {
      EN: {
        situation: 'A foundation raises money in campaigns, so its traffic arrives in bursts — and those are precisely the hours when the site must not be down.',
        work: 'Built the portal: an online donation module, an events calendar, and a news section in both languages the foundation publishes in.',
        outcome: 'Availability held at 99.9%, including through fundraising peaks.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Фонд собирает средства кампаниями, поэтому трафик приходит всплесками — и именно в эти часы сайт не имеет права лежать.',
        work: 'Разработал портал: модуль онлайн-пожертвований, календарь мероприятий и новостной блок на обоих языках, на которых фонд говорит.',
        outcome: 'Доступность держалась на 99.9%, в том числе на пиках фандрайзинговых акций.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: 'beyond-pl',
    client: 'Beyond.pl',
    url: 'https://www.beyond.pl',
    status: 'published',
    period: '2022',
    capacity: SOLO,
    stack: ['WordPress', 'PHP'],
    sector: {
      EN: 'Data centre and cloud infrastructure',
      RU: 'ЦОД и облачная инфраструктура',
    },
    observed: 'WordPress; pl and en',
    case: {
      EN: {
        situation: 'A data centre sells something hard to put on a page: server configurations, colocation, capacity. A static brochure leaves the buyer to work it out.',
        work: 'Built the corporate site with an interactive server configuration calculator and a quote request flow, so a B2B buyer can price a shape before talking to anyone.',
        outcome: 'Pages open in under 1.2 seconds.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'ЦОД продаёт то, что трудно уместить на страницу: конфигурации серверов, размещение, мощности. Статичная брошюра оставляет покупателя разбираться самому.',
        work: 'Сделал корпоративный сайт с интерактивным калькулятором конфигураций серверов и формой запроса коммерческого предложения — B2B-покупатель может прикинуть конфигурацию до разговора с менеджером.',
        outcome: 'Страницы открываются быстрее 1.2 секунды.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: '33rdcompany',
    client: '33rd Company',
    url: 'https://www.33rdcompany.org',
    status: 'published',
    period: '2020',
    capacity: SOLO,
    sector: { EN: 'Property management, USA', RU: 'Управление недвижимостью, США' },
    observed: 'Squarespace today — the site has been replaced since',
    case: {
      EN: {
        situation: 'A management company handled tenants by hand: payments, maintenance requests, questions — all of it through a person.',
        work: 'Built the site and a tenant account area, with payment processing and maintenance requests submitted online.',
        outcome: '80% of routine enquiries moved to online forms.',
        evidence: 'Delivered under contract in 2020; the domain has since been rebuilt on a website builder, so what is there today is not this work.',
      },
      RU: {
        situation: 'Управляющая компания вела жильцов вручную: платежи, заявки на обслуживание, вопросы — всё через человека.',
        work: 'Сделал сайт и личный кабинет: приём платежей и подача заявок на обслуживание онлайн.',
        outcome: '80% рутинных обращений ушли в онлайн-формы.',
        evidence: 'Работа по договору, 2020 год. С тех пор сайт по этому адресу пересобран на конструкторе — то, что там сейчас, к этой работе отношения не имеет.',
      },
    },
  },
  {
    id: 'properstar',
    client: 'Properstar',
    url: 'https://www.properstar.com',
    status: 'published',
    period: '2023',
    capacity: SOLO,
    sector: { EN: 'Global property search', RU: 'Глобальный поиск недвижимости' },
    observed: 'Behind Azure WAF — no platform signals available',
    case: {
      EN: {
        situation: 'Searching for property across borders breaks on the small things: which currency, which language, and whether the area is in metres or feet.',
        work: 'Built the international search with multi-currency, multi-language and automatic unit conversion.',
        outcome: 'One interface that reads the same way to buyers in more than fifty countries.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Поиск недвижимости за границей спотыкается о мелочи: в какой валюте, на каком языке и в метрах или футах указана площадь.',
        work: 'Разработал международный поисковик с мультивалютностью, многоязычностью и автоконвертацией единиц измерения.',
        outcome: 'Один интерфейс, который одинаково читается покупателями более чем из пятидесяти стран.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: 'merchantwest',
    client: 'Merchant West',
    url: 'https://merchantwest.co.za',
    status: 'published',
    period: '2021',
    capacity: SOLO,
    stack: ['WordPress', 'PHP'],
    sector: { EN: 'Financial services, South Africa', RU: 'Финансовые услуги, ЮАР' },
    observed: 'WordPress + Google Site Kit',
    case: {
      EN: {
        situation: 'A finance company takes client documents through its website, and those are documents with a higher bar than a contact form.',
        work: 'Built the site with leasing calculators and secured forms for submitting financial documents.',
        outcome: 'The forms meet the handling requirements for financial data, and online enquiries went up.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Финансовая компания принимает документы клиентов через сайт, а это документы, к которым требования выше, чем к форме обратной связи.',
        work: 'Сделал сайт с онлайн-калькуляторами лизинга и защищёнными формами отправки финансовых документов.',
        outcome: 'Формы отвечают требованиям к обработке финансовых данных, число онлайн-заявок выросло.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
  {
    id: 'creditafricainvest',
    client: 'Credit Africa Invest',
    url: 'https://creditafricainvest.com',
    status: 'published',
    period: '2022',
    capacity: SOLO,
    stack: ['WordPress', 'PHP'],
    sector: { EN: 'Lending', RU: 'Кредитование' },
    observed: 'WordPress',
    case: {
      EN: {
        situation: 'A loan application took days: the form, the checks and the decision all passed through people.',
        work: 'Built the lending platform — a scoring questionnaire, a loan calculator, and integration with the bank APIs behind the decision.',
        outcome: 'An application is processed in minutes rather than days.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Заявку на кредит обрабатывали несколько дней: анкета, проверки и решение проходили через людей.',
        work: 'Разработал платформу кредитования — скоринговая анкета, калькулятор займов и интеграция с банковскими API, за которыми стоит решение.',
        outcome: 'Заявка обрабатывается за минуты вместо дней.',
        evidence: UNDER_CONTRACT.RU,
      },
    },
  },
];

/**
 * The shape a published entry has to fill in.
 *
 *   period    '2021'
 *   capacity  per-locale, how the work was engaged and in what role
 *   case      per-locale { situation, work, outcome, evidence }
 *             evidence is allowed to say plainly that there is none.
 *   publicName  false when the client may not be named; the sector is shown
 *               instead and the case loses nothing.
 */
// Stack is not on this list. It is the one field that can be read off the live
// site rather than recalled, so it is filled in above from what each domain
// serves — and left out entirely for the three sitting behind a WAF, which
// give up nothing. An absent stack is honest; a guessed one is not.
const REQUIRED = ['period', 'capacity', 'case'];

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
    // A client that may not be named is described by what they do instead.
    name: p.publicName === false ? p.sector[key] : p.client,
    sector: p.sector[key],
    named: p.publicName !== false,
    period: p.period,
    capacity: p.capacity[key] || p.capacity.EN,
    stack: p.stack || [],
    ...(p.case?.[key] || p.case?.EN || {}),
  }));
}

/** How many are ready. Used to decide whether a section exists at all. */
export function webProjectCount() {
  return WEB_PROJECTS.filter(isPublishable).length;
}
