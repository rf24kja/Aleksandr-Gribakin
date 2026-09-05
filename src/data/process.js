/**
 * How the work is done, and on what terms.
 *
 * This is the answer to the fear a portfolio cannot address on its own — not
 * "can he build it" but "will he still be here in three weeks". Cases prove
 * capability; this proves conduct.
 *
 * Two exports rather than one, because the commitments appear in three places
 * at once: the process section, the footer, and the `contact` output. Prose and
 * obligations are split so the response time is written down once and every
 * surface reads the same number. Two copies would eventually disagree, and the
 * one that disagreed would be a promise nobody meant to make.
 */

/** The six steps, in the order a client meets them. */
export const PROCESS = [
  {
    id: 'start',
    n: '01',
    title: { EN: 'Getting started', RU: 'Как начинаем' },
    body: {
      EN: 'A first call of 30–40 minutes: the problem, the constraints, what already exists. What I need from you is what has to work at the end, and by when. An estimate follows within two business days.',
      RU: 'Первый разговор — 30–40 минут: задача, ограничения, что уже есть. От вас нужно понимать, что должно работать в конце и к какому сроку. Оценку присылаю в течение двух рабочих дней после разговора.',
    },
  },
  {
    id: 'estimate',
    n: '02',
    title: { EN: 'How I estimate', RU: 'Как оцениваю' },
    body: {
      EN: 'Fixed per sprint or per milestone — you know the figure before work starts. It covers development, tests and handover. If the scope moves, you hear it immediately and get a new estimate before I begin, not a surprise at the end.',
      RU: 'Фикс за спринт или за веху — сумму вы знаете до начала работы. В оценку входит разработка, тесты и сдача. Если объём меняется по ходу, говорю сразу и присылаю новую оценку до того, как начну, — а не выставляю сюрприз в конце.',
    },
  },
  {
    id: 'deliver',
    n: '03',
    title: { EN: 'How I deliver', RU: 'Как сдаю' },
    body: {
      EN: 'Work is split into milestones. Each one ends in something that runs and can be opened, not a progress report. The code sits in your repository from day one — your access to it does not depend on whether we keep working together.',
      RU: 'Работа делится на вехи. В конце каждой — работающая часть, которую можно открыть и проверить, а не отчёт о процессе. Код лежит в вашем репозитории с первого дня: доступ к нему не зависит от того, продолжаем мы работать или нет.',
    },
  },
  {
    id: 'hours',
    n: '04',
    title: { EN: 'When I am available', RU: 'Когда я на связи' },
    body: {
      EN: 'London time (GMT/BST), Monday to Friday, 09:00–18:00. Replies within 2–4 hours during those hours, and within 24 hours guaranteed, weekends included.',
      RU: 'По лондонскому времени (GMT/BST), понедельник–пятница, 09:00–18:00. Отвечаю за 2–4 часа в рабочее время. Гарантированно — в течение 24 часов, включая выходные.',
    },
  },
  {
    id: 'warranty',
    n: '05',
    title: { EN: 'After handover', RU: 'После сдачи' },
    body: {
      EN: '30 days of free support: anything broken on my side is fixed at no charge. Beyond that, by separate arrangement.',
      RU: '30 дней бесплатной поддержки: если что-то сломалось по моей части — чиню без счёта. Дальше — по отдельной договорённости.',
    },
  },
  {
    id: 'payment',
    n: '06',
    title: { EN: 'Payment', RU: 'Оплата' },
    body: {
      EN: '50/50 in stages, or fixed per milestone. Work is done under contract and invoiced; invoices and closing documents are issued through a partner company acting as invoicing service / merchant of record. Details on request.',
      RU: 'Поэтапно 50/50 или фикс за веху. Работа по договору и инвойсам; счета и закрывающие документы выставляются через партнёрскую компанию (invoicing / merchant of record). Реквизиты по запросу.',
    },
  },
];

/**
 * The commitments, on their own.
 *
 * Deliberately not free text: the footer prints the hours, the `contact`
 * command prints the response time, and step 04 above prints both. Reading them
 * from one place is what keeps the three from drifting apart.
 */
export const TERMS = {
  hours: {
    tz: 'GMT/BST',
    zone: { EN: 'London time', RU: 'по лондонскому времени' },
    days: { EN: 'Mon–Fri', RU: 'Пн–Пт' },
    from: '09:00',
    to: '18:00',
  },
  response: {
    typical: { EN: '2–4 hours during working hours', RU: '2–4 часа в рабочее время' },
    guaranteed: { EN: 'within 24 hours, weekends included', RU: 'в течение 24 часов, включая выходные' },
  },
  warranty: {
    days: 30,
    note: { EN: '30 days of free bug fixing after handover', RU: '30 дней бесплатных исправлений после сдачи' },
  },
  payment: {
    model: { EN: '50/50 in stages, or fixed per milestone', RU: 'Поэтапно 50/50 или фикс за веху' },
  },
};

/** One line, so the hours never get typed out twice. */
export function hoursLine(lang = 'EN') {
  const key = lang === 'RU' ? 'RU' : 'EN';
  const h = TERMS.hours;
  return `${h.days[key]} ${h.from}–${h.to} ${h.tz}`;
}

export const CONTACTS = {
  // Forwarding is configured at the registrar now: hello@ lands in the owner's
  // mailbox. Read from here by the footer, the desktop Mail window, the
  // terminal's contact output and the privacy policy, so it is changed once.
  email: 'hello@dev24.pro',
  telegram: '@dev24pro',
  telegramUrl: 'https://t.me/dev24pro',
};

// The address the terminal's `coffee` command has always printed. It lives here
// now because business and desktop offer the same thing, and a wallet address
// typed out three times is a wallet address that will eventually differ in one
// of them. Wording is in PONYTAIL.LOCALE.COFFEE; only the facts are here.
export const DONATION = {
  network: 'USDT TRC-20',
  address: 'TWTCH2ZhyKvzZU1ph6h1d4vTHpHyJDkN5i',
};

export const LEGAL = {
  name: { EN: 'Aleksandr Gribakin', RU: 'Александр Грибакин' },
  role: {
    EN: 'Lead Full Stack & DevOps Engineer',
    RU: 'Lead Full Stack & DevOps Engineer',
  },
  basis: {
    EN: 'Work under contract, invoiced (Invoicing / Business Accounts)',
    RU: 'Работа по договору и инвойсам (Invoicing / Business Accounts)',
  },
  details: { EN: 'Details on request', RU: 'Реквизиты по запросу' },
  privacy: { EN: '/privacy', RU: '/ru/privacy' },
};
