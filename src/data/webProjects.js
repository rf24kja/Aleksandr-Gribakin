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
 * Four of the ten belong to companies with large product teams of their own,
 * and "solo" there read as "I built their site" — the most checkable sentence
 * on the page, and the easiest to disprove. The author supplied what the work
 * actually was: a regional module, a franchise office, a sub-module of a
 * portal. Narrower, and impossible to argue with.
 */
const CONTRACTOR_FE = {
  EN: 'Front end, in a contractor\'s team',
  RU: 'Фронтенд, в составе команды подрядчика',
};
const FE_MODULE = (what) => ({
  EN: `Front-end developer, ${what.EN}`,
  RU: `Фронтенд-разработчик, ${what.RU}`,
});

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
    sector: {
      EN: 'Luxury real estate — a regional office of the network',
      RU: 'Люксовая недвижимость — региональное представительство сети',
    },
    observed: 'Next.js behind Cloudflare',
    metrics: [
      { label: { EN: 'Listing depth per visit', RU: 'Глубина просмотра листингов' },
        delta: { EN: 'increased', RU: 'выросла' },
        note: { EN: 'Reported by the client, not independently measured', RU: 'По данным заказчика, независимого замера нет' } },
      { label: { EN: 'Media delivery', RU: 'Отдача медиа' },
        delta: { EN: 'WebP + lazy loading', RU: 'WebP + отложенная загрузка' },
        note: { EN: 'No baseline was measured before the work', RU: 'Замера до работы не делалось' } },
    ],
    scope: {
      EN: ['Property catalogue: listing grid, filters by location, property card',
        'Media galleries with lazy loading and WebP delivery',
        'Interactive map bound to the same filter state as the list',
        'Back end for the catalogue and its media pipeline'],
      RU: ['Каталог объектов: сетка, фильтры по локациям, карточка объекта',
        'Медиагалереи с отложенной загрузкой и отдачей в WebP',
        'Интерактивная карта, связанная с тем же состоянием фильтра, что и список',
        'Бэкенд каталога и конвейер обработки медиа'],
    },
    complexity: {
      EN: ['Luxury listings carry commissioned photography and floor plans. The assets that sell the property are the same ones that make the page heavy, so they could not simply be compressed away.',
        'Map and list share one filter state: a change in either has to move the other without a round trip, and without losing the position the visitor had reached in the catalogue.'],
      RU: ['Элитные объекты продаются съёмкой и планировками. Те же файлы, что продают, делают страницу тяжёлой, поэтому «просто сжать» было нельзя.',
        'Карта и список делят одно состояние фильтра: изменение в любом из них должно двигать второй без обращения к серверу и без потери позиции, до которой посетитель дошёл в каталоге.'],
    },
    case: {
      EN: {
        situation: 'A luxury listing lives on its media: galleries, floor plans, commissioned photography. The same files that sell the property are what make the page slow.',
        work: 'Built the site and property catalogue for a regional office of the network — media galleries, filtering by location, an interactive map — and took the weight out of the media path with lazy loading and WebP.',
        outcome: 'Listings are browsed deeper: visitors go further into the catalogue instead of leaving on the first heavy page.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Элитный объект продаётся медиа: галереями, планировками, съёмкой. Те же файлы, что продают, и тормозят страницу.',
        work: 'Разработал веб-ресурс и каталог объектов для регионального представительства сети — медиагалереи, фильтрация по локациям, интерактивная карта — и разгрузил отдачу медиа: отложенная загрузка и WebP.',
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
    capacity: CONTRACTOR_FE,
    sector: {
      EN: 'Car rental — a regional booking module',
      RU: 'Прокат автомобилей — региональный модуль бронирования',
    },
    observed: 'Behind a WAF — no platform signals available',
    metrics: [
      { label: { EN: 'Peak season load', RU: 'Нагрузка в пиковый сезон' },
        delta: { EN: 'held', RU: 'выдержана' },
        note: { EN: 'A rental business takes its year in a few weeks', RU: 'Прокат зарабатывает год за несколько недель' } },
      { label: { EN: 'Checkout on a phone', RU: 'Оформление с телефона' },
        delta: { EN: 'responsive', RU: 'адаптивно' },
        note: { EN: 'The device most bookings are made on', RU: 'Устройство, с которого делают большинство броней' } },
    ],
    scope: {
      EN: ['Booking search: pick-up and drop-off location, dates, vehicle class',
        'Result list and vehicle selection screens',
        'Checkout forms and their responsive behaviour',
        'Front-end integration with the payment gateway flow'],
      RU: ['Поиск бронирования: место получения и возврата, даты, класс автомобиля',
        'Экраны выдачи и выбора автомобиля',
        'Формы оформления заказа и их адаптивное поведение',
        'Фронтенд-интеграция с потоком платёжного шлюза'],
    },
    complexity: {
      EN: ['Booking is a funnel where every step can lose the customer, and payment is the step that cannot be retried casually. A form that misbehaves on a phone is a booking that goes to a competitor.',
        'A regional module inside a larger platform: the work had to fit conventions set by other teams rather than invent its own.'],
      RU: ['Бронирование — воронка, где клиента можно потерять на любом шаге, а шаг оплаты нельзя переиграть небрежно. Форма, которая ведёт себя странно на телефоне, — это бронь, ушедшая к конкуренту.',
        'Региональный модуль внутри большой платформы: работа должна была ложиться в соглашения, заданные другими командами, а не изобретать свои.'],
    },
    case: {
      EN: {
        situation: 'Booking is the whole reason anyone opens a rental site: a location, a pair of dates, a class of car, and a checkout that has to work on the phone it is opened on.',
        work: 'Built and optimised the front end of the regional booking module for one market, as part of a contractor\'s team — search by location, dates and vehicle class, and the responsive integration of the checkout forms.',
        outcome: 'The interfaces hold through the holiday peak, when a rental business takes its year in a few weeks.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Бронирование — то, ради чего вообще открывают сайт проката: локация, даты, класс авто и оформление, которое обязано работать на том телефоне, с которого его открыли.',
        work: 'Разрабатывал и оптимизировал фронтенд-интерфейсы регионального модуля бронирования под конкретный рынок, в составе команды подрядчика — поиск по локациям, датам и классам авто и адаптивная интеграция форм оформления заказа.',
        outcome: 'Интерфейсы держат пиковый сезон отпусков, когда прокат зарабатывает год за несколько недель.',
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
    capacity: FE_MODULE({ EN: 'catalogue module', RU: 'модуль каталога' }),
    sector: {
      EN: 'Property portal, India — catalogue search',
      RU: 'Портал недвижимости, Индия — поиск по каталогу',
    },
    observed: 'Behind a WAF — no platform signals available',
    metrics: [
      { label: { EN: 'Filter response', RU: 'Отклик фильтров' },
        delta: { EN: 'immediate', RU: 'мгновенный' },
        note: { EN: 'Over a catalogue of national scale', RU: 'На каталоге национального масштаба' } },
      { label: { EN: 'Built for', RU: 'Рассчитано на' },
        delta: { EN: 'weak mobile connections', RU: 'слабый мобильный интернет' },
        note: { EN: 'Not an office connection', RU: 'Не на офисный канал' } },
    ],
    scope: {
      EN: ['Geo search: locality, radius and map-bounded queries',
        'Multi-criteria filters over the listing catalogue',
        'The property card those filters open',
        'Result rendering tuned for low-bandwidth devices'],
      RU: ['GEO-поиск: район, радиус и запросы по границам карты',
        'Многокритериальные фильтры по каталогу объектов',
        'Карточка объекта, которая из них открывается',
        'Отрисовка выдачи, рассчитанная на устройства со слабым каналом'],
    },
    complexity: {
      EN: ['Filters are the part of a portal people actually use, and they compose: every added criterion multiplies the states the interface has to stay coherent in.',
        'The audience browses on phones over connections that cannot afford a heavy page, so the budget was set by the slowest realistic device rather than by a developer laptop.'],
      RU: ['Фильтры — то, чем на портале реально пользуются, и они комбинируются: каждый новый критерий умножает число состояний, в которых интерфейс обязан остаться связным.',
        'Аудитория смотрит с телефонов на каналах, которые тяжёлой страницы не выдержат, поэтому бюджет задавало самое медленное реальное устройство, а не ноутбук разработчика.'],
    },
    case: {
      EN: {
        situation: 'A portal of that size is read mostly on a phone, often on a connection that cannot afford a heavy page — and the filters are the part people actually use.',
        work: 'Designed and built the geo search module and the interactive catalogue filters, and the property card that opens from them.',
        outcome: 'Filters answer immediately over that volume, and the interface is built for a weak mobile connection rather than an office one.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Портал такого размера смотрят в основном с телефона и часто на связи, которая тяжёлой страницы не выдержит, — а фильтры и есть то, чем реально пользуются.',
        work: 'Спроектировал и сверстал модуль GEO-поиска и интерактивные фильтры каталога, а также карточку объекта, которая из них открывается.',
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
    metrics: [
      { label: { EN: 'Enquiry conversion', RU: 'Конверсия в заявку' },
        delta: { EN: '+35%', RU: '+35%' },
        note: { EN: 'Reported by the client after launch', RU: 'По данным заказчика после запуска' } },
      { label: { EN: 'Equipment filters', RU: 'Фильтры по технике' },
        after: 3, of: 3, unit: { EN: 'parameters', RU: 'параметра' },
        note: { EN: 'Lifting capacity, lift height, jib radius', RU: 'Грузоподъёмность, высота подъёма, вылет стрелы' } },
      { label: { EN: 'Locales', RU: 'Локали' },
        after: 3, of: 3, unit: { EN: 'languages', RU: 'языка' },
        note: { EN: 'pt-BR, English, Spanish', RU: 'pt-BR, английский, испанский' } },
    ],
    scope: {
      EN: ['Rental catalogue built from scratch: equipment model, specifications, availability',
        'Filters by lifting capacity, lift height and jib radius',
        'Cost calculator for a shift and for a rental period',
        'Enquiry forms wired to the catalogue selection',
        'Three locales across the whole site'],
      RU: ['Каталог аренды с нуля: модель техники, характеристики, доступность',
        'Фильтры по грузоподъёмности, высоте подъёма и вылету стрелы',
        'Калькулятор стоимости смены и периода аренды',
        'Формы заявки, связанные с выбором в каталоге',
        'Три локали на весь сайт'],
    },
    complexity: {
      EN: ['Crane hire is specified, not browsed. A customer arrives knowing the load and the height they need, so the filter had to speak the trade\u2019s own parameters rather than offer categories.',
        'Price depends on the shift, the period and the machine, so the calculator had to reproduce the commercial rules rather than multiply a day rate.',
        'The enquiry comes from a construction site, on a phone. That set the layout constraints before any design was drawn.'],
      RU: ['Кран не выбирают перебором. Клиент приходит, зная нагрузку и высоту, — поэтому фильтр должен был говорить параметрами отрасли, а не предлагать категории.',
        'Цена зависит от смены, периода и машины, поэтому калькулятор должен был воспроизвести коммерческие правила, а не умножить дневную ставку.',
        'Заявку отправляют со стройки, с телефона. Это задало ограничения по вёрстке раньше, чем был нарисован дизайн.'],
    },
    case: {
      EN: {
        situation: 'Heavy plant was rented without a working shop window: to match a machine to a job, or to get a price, you had to go through a manager.',
        work: 'Designed and built the rental catalogue from scratch: filters by lifting capacity, lift height and jib radius, and a calculator that prices a shift or a rental period. Made to work on a phone, because enquiries come from the site rather than the office.',
        outcome: 'Enquiry conversion up 35%.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Технику сдавали без работающей витрины: подобрать машину под задачу или узнать цену можно было только через менеджера.',
        work: 'С нуля спроектировал и разработал каталог аренды: фильтры по грузоподъёмности, высоте подъёма и вылету стрелы, калькулятор стоимости смены и периода аренды. Сделал пригодным для телефона — заявки приходят со стройки, а не из офиса.',
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
    metrics: [
      { label: { EN: 'Availability', RU: 'Доступность' },
        after: 99.9, of: 100, unit: '%',
        note: { EN: 'Including fundraising peaks', RU: 'В том числе на пиках фандрайзинга' } },
      { label: { EN: 'Downtime budget', RU: 'Бюджет простоя' },
        after: 43, of: 43, unit: { EN: 'min/month', RU: 'мин/мес' },
        note: { EN: 'What 99.9% means in minutes', RU: 'Что 99.9% значит в минутах' } },
      { label: { EN: 'Locales', RU: 'Локали' },
        after: 2, of: 2, unit: { EN: 'languages', RU: 'языка' },
        note: { EN: 'English and Chinese', RU: 'Английский и китайский' } },
    ],
    scope: {
      EN: ['Online donation module',
        'Events calendar with registration',
        'News section published in both languages',
        'Portal front end and back end'],
      RU: ['Модуль онлайн-пожертвований',
        'Календарь мероприятий с регистрацией',
        'Новостной раздел, публикуемый на обоих языках',
        'Фронтенд и бэкенд портала'],
    },
    complexity: {
      EN: ['A foundation raises money in campaigns, so traffic arrives in bursts. The hours when the site is least allowed to fail are exactly the hours it is under most load.',
        'Donation is a payment path in a charity context: a failed transaction is not a lost sale, it is a donor who does not try again.',
        'Two writing systems in one layout, with content maintained in both by non-technical staff.'],
      RU: ['Фонд собирает средства кампаниями, поэтому трафик приходит всплесками. Часы, когда сайту меньше всего можно падать, — ровно часы максимальной нагрузки.',
        'Пожертвование — платёжный путь в благотворительном контексте: сорвавшаяся транзакция это не потерянная продажа, а жертвователь, который не попробует снова.',
        'Две письменности в одной вёрстке, и контент в обеих ведут не технические сотрудники.'],
    },
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
    metrics: [
      { label: { EN: 'Page load', RU: 'Загрузка страницы' },
        after: 1.2, of: 1.2, unit: { EN: 's', RU: 'с' },
        note: { EN: 'Under 1.2 s. No baseline was measured before', RU: 'Меньше 1.2 с. Замера до работы не делалось' } },
      { label: { EN: 'Configurable in the calculator', RU: 'Настраивается в калькуляторе' },
        delta: { EN: 'Dedicated / VPS, racks and units, bandwidth, SLA tier', RU: 'Dedicated / VPS, стойки и юниты, полоса, уровень SLA' } },
    ],
    scope: {
      EN: ['Corporate site for a data centre and cloud operator',
        'Capacity calculator: dedicated and VPS configurations, rack and unit count, bandwidth, Tier III/IV service levels',
        'Quote request flow carrying the configuration through to the sales team',
        'Polish and English throughout'],
      RU: ['Корпоративный сайт оператора ЦОД и облака',
        'Калькулятор мощности: конфигурации Dedicated и VPS, стойки и юниты (U), полоса пропускания, уровни SLA Tier III/IV',
        'Заявка на коммерческое предложение, доносящая конфигурацию до отдела продаж',
        'Польский и английский по всему сайту'],
    },
    complexity: {
      EN: ['Colocation is priced on a lattice of choices — rack space, power, bandwidth, service tier — and a calculator that lets a buyer assemble an impossible combination costs the sales team more time than it saves.',
        'The buyer is technical and arrives sceptical. The page is read by someone who operates infrastructure for a living, which sets a different bar for both the wording and the load time.'],
      RU: ['Колокация считается по решётке выборов — место в стойке, питание, полоса, уровень сервиса, — и калькулятор, позволяющий собрать невозможную комбинацию, отнимает у продаж больше времени, чем экономит.',
        'Покупатель технический и приходит скептиком. Страницу читает человек, который сам эксплуатирует инфраструктуру, — это поднимает планку и к формулировкам, и к скорости загрузки.'],
    },
    case: {
      EN: {
        situation: 'A data centre sells something hard to put on a page: server configurations, colocation, capacity. A static brochure leaves the buyer to work it out.',
        work: 'Built the corporate site with a capacity calculator for dedicated and VPS configurations — rack and unit count, bandwidth, and Tier III/IV service levels — and a quote request flow, so a B2B buyer can price a shape before talking to anyone.',
        outcome: 'Pages open in under 1.2 seconds.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'ЦОД продаёт то, что трудно уместить на страницу: конфигурации серверов, размещение, мощности. Статичная брошюра оставляет покупателя разбираться самому.',
        work: 'Сделал корпоративный сайт с калькулятором мощности под Dedicated и VPS — стойки и юниты (U), полоса пропускания, уровни SLA Tier III/IV — и формой запроса коммерческого предложения: B2B-покупатель прикидывает конфигурацию до разговора с менеджером.',
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
    metrics: [
      { label: { EN: 'Routine enquiries handled online', RU: 'Рутинных обращений ушло в онлайн' },
        after: 80, of: 100, unit: '%',
        note: { EN: 'Previously handled by a person, one at a time', RU: 'Раньше — через человека, по одному' } },
      { label: { EN: 'Tenant portal', RU: 'Личный кабинет жильца' },
        delta: { EN: 'maintenance, rent, credit check', RU: 'заявки, аренда, кредитный рейтинг' } },
    ],
    scope: {
      EN: ['Company site and tenant portal',
        'Maintenance request submission and tracking',
        'Rent paid online',
        'Credit check on prospective tenants at application'],
      RU: ['Сайт компании и личный кабинет жильца',
        'Подача и отслеживание заявок на ремонт',
        'Оплата аренды онлайн',
        'Проверка кредитного рейтинга при подаче заявки на заселение'],
    },
    complexity: {
      EN: ['Property management is a queue of small identical requests, each of which used to consume a person. The value was not any single feature but taking the human off the repetitive path.',
        'Money and a credit check in the same flow: two integrations where a failure has consequences beyond an error message.'],
      RU: ['Управление недвижимостью — очередь мелких одинаковых обращений, каждое из которых съедало человека. Ценность была не в отдельной функции, а в том, чтобы убрать человека с повторяющегося пути.',
        'Деньги и проверка кредитного рейтинга в одном потоке: две интеграции, где сбой имеет последствия за пределами сообщения об ошибке.'],
    },
    case: {
      EN: {
        situation: 'A management company handled tenants by hand: payments, maintenance requests, questions — all of it through a person.',
        work: 'Built the site and the tenant portal: maintenance requests, rent paid online, and a credit check on prospective tenants.',
        outcome: '80% of routine enquiries moved to online forms.',
        evidence: 'Delivered under contract in 2020; the domain has since been rebuilt on a website builder, so what is there today is not this work.',
      },
      RU: {
        situation: 'Управляющая компания вела жильцов вручную: платежи, заявки на обслуживание, вопросы — всё через человека.',
        work: 'Сделал сайт и личный кабинет жильца: заявки на ремонт, оплата аренды онлайн и проверка кредитного рейтинга при заселении.',
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
    capacity: FE_MODULE({ EN: 'localisation modules', RU: 'модули локализации' }),
    sector: {
      EN: 'Global property search — currency and locale',
      RU: 'Глобальный поиск недвижимости — валюта и локали',
    },
    observed: 'Behind Azure WAF — no platform signals available',
    metrics: [
      { label: { EN: 'Countries served by one interface', RU: 'Стран в одном интерфейсе' },
        after: 50, of: 50, unit: '+',
        note: { EN: 'Currency, language and units resolved per visitor', RU: 'Валюта, язык и единицы — под каждого посетителя' } },
      { label: { EN: 'Converted automatically', RU: 'Конвертируется автоматически' },
        delta: { EN: 'currency, area units, locale', RU: 'валюта, единицы площади, локаль' } },
    ],
    scope: {
      EN: ['Currency conversion across the catalogue',
        'Area unit conversion between metric and imperial',
        'Locale resolution and language switching',
        'The listing surfaces those modules feed'],
      RU: ['Конвертация валют по всему каталогу',
        'Конвертация единиц площади между метрической и имперской системами',
        'Определение локали и переключение языка',
        'Поверхности выдачи, которые эти модули питают'],
    },
    complexity: {
      EN: ['Cross-border search fails on details, not features. A price in the wrong currency or an area in the wrong unit is not a rounding error to a buyer, it is a listing they discard.',
        'Conversion has to be consistent everywhere at once — list, card, filter and sort — because a figure that changes between two screens destroys trust faster than a missing feature.'],
      RU: ['Трансграничный поиск ломается на мелочах, а не на функциях. Цена в чужой валюте или площадь в чужих единицах — для покупателя не погрешность, а причина отбросить объект.',
        'Конвертация обязана быть согласованной сразу везде — список, карточка, фильтр и сортировка, — потому что цифра, меняющаяся между двумя экранами, убивает доверие быстрее, чем отсутствующая функция.'],
    },
    case: {
      EN: {
        situation: 'Searching for property across borders breaks on the small things: which currency, which language, and whether the area is in metres or feet.',
        work: 'Built the user-facing modules for currency conversion, unit conversion and catalogue localisation.',
        outcome: 'One interface that reads the same way to buyers in more than fifty countries.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Поиск недвижимости за границей спотыкается о мелочи: в какой валюте, на каком языке и в метрах или футах указана площадь.',
        work: 'Разработал пользовательские модули конвертации валют, единиц измерения и локализации каталога.',
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
    metrics: [
      { label: { EN: 'Online enquiries', RU: 'Онлайн-заявки' },
        delta: { EN: 'increased', RU: 'выросли' },
        note: { EN: 'Reported by the client; no baseline figure supplied', RU: 'По данным заказчика; базовой цифры нет' } },
      { label: { EN: 'Document submission', RU: 'Отправка документов' },
        delta: { EN: 'meets financial data handling requirements', RU: 'по требованиям к финансовым данным' } },
    ],
    scope: {
      EN: ['Site for a financial services company',
        'Leasing calculators',
        'Secured forms for submitting financial documents',
        'Handling rules appropriate to financial data'],
      RU: ['Сайт финансовой компании',
        'Онлайн-калькуляторы лизинга',
        'Защищённые формы отправки финансовых документов',
        'Правила обработки, соответствующие финансовым данным'],
    },
    complexity: {
      EN: ['A leasing calculator is a commercial document in disguise. The numbers it shows set an expectation the sales team then has to honour, so the rules behind it cannot be approximate.',
        'Client documents arriving through a web form raise the bar above a contact form: what is transmitted, where it rests and who can reach it all become design decisions rather than defaults.'],
      RU: ['Калькулятор лизинга — коммерческий документ в маскировке. Цифры, которые он показывает, задают ожидание, которое потом придётся выполнять отделу продаж, поэтому правила за ним не могут быть приблизительными.',
        'Документы клиентов, приходящие через веб-форму, поднимают планку выше обычной формы обратной связи: что передаётся, где лежит и кто имеет доступ — становятся проектными решениями, а не настройками по умолчанию.'],
    },
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
    metrics: [
      { label: { EN: 'Application processing', RU: 'Обработка заявки' },
        before: 2880, after: 5, unit: { EN: 'min', RU: 'мин' }, better: 'lower',
        // Minutes are what the bars compare; days are what a reader thinks in.
        displayBefore: { EN: '~2 days', RU: '~2 дня' },
        displayAfter: { EN: '~5 min', RU: '~5 мин' },
        note: { EN: 'From a couple of days to a couple of minutes', RU: 'С пары дней до пары минут' } },
      { label: { EN: 'Decision path', RU: 'Путь к решению' },
        delta: { EN: 'scoring form to bank API to answer', RU: 'скоринговая анкета — банковский API — ответ' } },
    ],
    scope: {
      EN: ['Online lending platform',
        'Scoring questionnaire feeding the decision',
        'Loan calculator',
        'Integration with the bank APIs behind the approval'],
      RU: ['Онлайн-платформа кредитования',
        'Скоринговая анкета, питающая решение',
        'Калькулятор займов',
        'Интеграция с банковскими API, за которыми стоит одобрение'],
    },
    complexity: {
      EN: ['The delay was never the arithmetic. The form, the checks and the decision each passed through a person, so removing days meant removing hand-offs rather than speeding up a calculation.',
        'A lending decision is answered by external systems on their own schedule, so the flow had to stay coherent when an upstream API was slow or unavailable rather than leave an applicant watching a spinner.'],
      RU: ['Задержка была не в арифметике. Анкета, проверки и решение проходили через людей, поэтому убрать дни означало убрать передачи из рук в руки, а не ускорить вычисление.',
        'Решение по кредиту дают внешние системы в своём темпе, поэтому поток должен был оставаться связным, когда внешний API медленный или недоступен, а не оставлять заявителя смотреть на крутилку.'],
    },
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
  // Localised leaves are `{ EN, RU }`; plain values (a number, a bare unit like
  // '%') pass through untouched, so a metric only carries translations where a
  // translation is meaningful.
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && (v.EN || v.RU)
    ? (v[key] ?? v.EN)
    : v);

  return WEB_PROJECTS.filter(isPublishable).map((p) => ({
    id: p.id,
    // A client that may not be named is described by what they do instead.
    name: p.publicName === false ? p.sector[key] : p.client,
    sector: p.sector[key],
    named: p.publicName !== false,
    period: p.period,
    capacity: p.capacity[key] || p.capacity.EN,
    stack: p.stack || [],
    scope: p.scope?.[key] || p.scope?.EN || [],
    complexity: p.complexity?.[key] || p.complexity?.EN || [],
    metrics: (p.metrics || []).map((m) => ({
      label: pick(m.label),
      unit: pick(m.unit),
      note: pick(m.note),
      delta: pick(m.delta),
      before: m.before,
      after: m.after,
      displayBefore: pick(m.displayBefore),
      displayAfter: pick(m.displayAfter),
      of: m.of,
      better: m.better,
    })),
    ...(p.case?.[key] || p.case?.EN || {}),
  }));
}

/** How many are ready. Used to decide whether a section exists at all. */
export function webProjectCount() {
  return WEB_PROJECTS.filter(isPublishable).length;
}
