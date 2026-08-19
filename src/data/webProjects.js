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

const SOLO = { EN: 'Sole developer, front end and back end', RU: 'Единственный разработчик, фронтенд и бэкенд' };

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
      { label: { EN: 'Pages viewed per visit', RU: 'Страниц за визит' },
        before: 1.8, after: 4.1, unit: { EN: 'pages', RU: 'стр.' }, better: 'higher',
        note: { EN: 'More than doubled', RU: 'Рост более чем вдвое' } },
      { label: { EN: 'Mobile Lighthouse', RU: 'Мобильный Lighthouse' },
        before: 45, after: 92, of: 100, better: 'higher',
        displayAfter: { EN: '92+', RU: '92+' },
        note: { EN: 'Google\u2019s page-speed score out of 100. Over 55% of mobile visitors had been leaving the heavy gallery', RU: 'Оценка скорости страницы от Google, из 100. С тяжёлой галереи уходило больше 55% мобильных посетителей' } },
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
      EN: ['Lazy loading for high-resolution media and linked comparable listings: a premium gallery weighs enough that on a phone it is itself the reason people leave.',
        'Luxury listings carry commissioned photography and floor plans. The assets that sell the property are the same ones that make the page heavy, so they could not simply be compressed away.',
        'Map and list share one filter state: a change in either has to move the other without a round trip, and without losing the position the visitor had reached in the catalogue.'],
      RU: ['Ленивая загрузка медиа высокого разрешения и связки похожих объектов: галерея премиум-класса весит столько, что на мобильном она и есть причина отказа.',
        'Элитные объекты продаются съёмкой и планировками. Те же файлы, что продают, делают страницу тяжёлой, поэтому «просто сжать» было нельзя.',
        'Карта и список делят одно состояние фильтра: изменение в любом из них должно двигать второй без обращения к серверу и без потери позиции, до которой посетитель дошёл в каталоге.'],
    },
    case: {
      EN: {
        situation: 'A luxury listing lives on its media: galleries, floor plans, commissioned photography. The same files that sell the property are what make the page slow.',
        work: 'Built the site and property catalogue for a regional office of the network — media galleries, filtering by location, an interactive map. Then made the pages light: images load as you scroll to them, in a format about a third the size of the originals.',
        outcome: 'Visitors went from about 1.8 pages a visit to 4.1, and Google\u2019s mobile speed score from 45 to 92 and above. The heavy gallery had been turning away more than half of the people arriving on a phone.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Элитный объект продаётся медиа: галереями, планировками, съёмкой. Те же файлы, что продают, и тормозят страницу.',
        work: 'Сделал сайт и каталог объектов для регионального представительства сети — медиагалереи, фильтрация по локациям, интерактивная карта. Затем облегчил страницы: изображения грузятся по мере прокрутки и в формате примерно втрое легче исходного.',
        outcome: 'Посетители стали смотреть ~4.1 страницы за визит вместо ~1.8, оценка скорости от Google на мобильных — с 45 до 92+. До этого тяжёлая галерея прогоняла больше половины тех, кто заходил с телефона.',
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
      { label: { EN: 'Result render and filtering', RU: 'Рендер и фильтрация выдачи' },
        before: 2.8, after: 0.6, unit: { EN: 's', RU: 'с' }, better: 'lower',
        note: { EN: 'The step between searching and choosing a car', RU: 'Шаг между поиском и выбором автомобиля' } },
      { label: { EN: 'Peak season', RU: 'Пиковый сезон' },
        delta: { EN: 'held', RU: 'выдержан' },
        note: { EN: 'A rental business takes its year in a few weeks', RU: 'Прокат зарабатывает год за несколько недель' } },
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
      EN: ['Search and booking UI modules refactored and their reactive state tightened: the result list was re-rendering in full where a single parameter had changed.',
        'Booking is a funnel where every step can lose the customer, and payment is the step that cannot be retried casually. A form that misbehaves on a phone is a booking that goes to a competitor.',
        'A regional module inside a larger platform: the work had to fit conventions set by other teams rather than invent its own.'],
      RU: ['Рефакторинг UI-модулей поиска и бронирования и оптимизация реактивного состояния: выдача перерисовывалась целиком там, где менялся один параметр.',
        'Бронирование — воронка, где клиента можно потерять на любом шаге, а шаг оплаты нельзя переиграть небрежно. Форма, которая ведёт себя странно на телефоне, — это бронь, ушедшая к конкуренту.',
        'Региональный модуль внутри большой платформы: работа должна была ложиться в соглашения, заданные другими командами, а не изобретать свои.'],
    },
    case: {
      EN: {
        situation: 'Booking is the whole reason anyone opens a rental site. Pick-up point, dates, class of car, then checkout — and most of that happens on a phone.',
        work: 'Built and optimised the front end of the regional booking module for one market, as part of a contractor\'s team — search by location, dates and vehicle class, and the responsive integration of the checkout forms.',
        outcome: 'Rendering and filtering the result list went from 2.8 seconds to 0.6 — the step between searching and choosing a car — and the module holds through the holiday peak.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Ради бронирования сайт проката и открывают. Место, даты, класс машины, потом оформление — и всё это чаще всего с телефона.',
        work: 'Разрабатывал и оптимизировал фронтенд-интерфейсы регионального модуля бронирования под конкретный рынок, в составе команды подрядчика — поиск по локациям, датам и классам авто и адаптивная интеграция форм оформления заказа.',
        outcome: 'Рендер и фильтрация выдачи — с 2.8 до 0.6 секунды. Это шаг между поиском и выбором машины, и модуль держит его в пиковый сезон.',
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
      { label: { EN: 'Filter response over the catalogue', RU: 'Отклик фильтров на каталоге' },
        before: 1750, after: 200, unit: { EN: 'ms', RU: 'мс' }, better: 'lower',
        displayBefore: { EN: '1.5-2.0 s', RU: '1.5-2.0 с' }, displayAfter: { EN: '<200 ms', RU: '<200 мс' },
        note: { EN: 'Thousands of listings, on a phone', RU: 'Многотысячный каталог, с телефона' } },
      { label: { EN: 'Long lists', RU: 'Длинные списки' },
        delta: { EN: 'virtualised, filters debounced', RU: 'виртуализация, дебаунсинг фильтров' },
        note: { EN: 'Scrolling stays smooth on a weak device', RU: 'Скролл не фризит на слабом устройстве' } },
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
      EN: ['Long lists virtualised and filters debounced: a catalogue of thousands cannot be rendered whole, and a filter that refetches on every keystroke spends the visitor\u2019s bandwidth and battery.',
        'Filters are the part of a portal people actually use, and they compose: every added criterion multiplies the states the interface has to stay coherent in.',
        'The audience browses on phones over connections that cannot afford a heavy page, so the budget was set by the slowest realistic device rather than by a developer laptop.'],
      RU: ['Виртуализация длинных списков и дебаунсинг фильтров: каталог на тысячи объектов нельзя рендерить целиком, а фильтр, дёргающий выдачу на каждое нажатие, съедает и сеть, и батарею.',
        'Фильтры — то, чем на портале реально пользуются, и они комбинируются: каждый новый критерий умножает число состояний, в которых интерфейс обязан остаться связным.',
        'Аудитория смотрит с телефонов на каналах, которые тяжёлой страницы не выдержат, поэтому бюджет задавало самое медленное реальное устройство, а не ноутбук разработчика.'],
    },
    case: {
      EN: {
        situation: 'A portal of that size is read mostly on a phone, often on a connection that cannot afford a heavy page — and the filters are the part people actually use.',
        work: 'Built the map search, the catalogue filters and the property card behind them, then made them hold up at that size: long result lists render only what is on screen, filters wait for you to stop typing before they search, and a changed filter updates the list instead of rebuilding the page.',
        outcome: 'Filter response went from 1.5-2.0 seconds to under 200 ms across a catalogue of thousands, and scrolling stays smooth on a weak phone rather than only on a developer laptop.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Портал такого размера смотрят в основном с телефона и часто на связи, которая тяжёлой страницы не выдержит, — а фильтры и есть то, чем реально пользуются.',
        work: 'Сделал поиск по карте, фильтры каталога и карточку объекта за ними, а потом добился, чтобы они выдерживали такой объём: длинные списки отрисовываются только на видимом экране, фильтры ждут, пока вы закончите вводить, и смена фильтра обновляет список, а не перестраивает страницу.',
        outcome: 'Отклик фильтров — с 1.5-2.0 секунд до менее 200 мс на каталоге в тысячи объектов, и скролл остаётся плавным на слабом телефоне, а не только на ноутбуке разработчика.',
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
        before: 0.8, after: 3.2, unit: '%', better: 'higher',
        note: { EN: 'Client\u2019s own figure, before and after launch', RU: 'Цифры заказчика, до и после запуска' } },
      { label: { EN: 'Enquiries priced automatically', RU: 'Заявок с автоматическим расчётом' },
        before: 0, after: 75, of: 100, unit: '%', better: 'higher',
        displayBefore: { EN: 'none', RU: 'нет' }, displayAfter: { EN: '>75%', RU: '>75%' },
        note: { EN: 'Every shift and machine used to be priced by a manager', RU: 'Раньше смену и технику подбирал менеджер' } },
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
      EN: ['Automatic pricing in place of a manager: matching a shift and a machine had been entirely manual, so the calculator had to replace a person rather than a form.',
        'Crane hire is specified, not browsed. A customer arrives knowing the load and the height they need, so the filter had to speak the trade\u2019s own parameters rather than offer categories.',
        'Price depends on the shift, the period and the machine, so the calculator had to reproduce the commercial rules rather than multiply a day rate.',
        'The enquiry comes from a construction site, on a phone. That set the layout constraints before any design was drawn.'],
      RU: ['Автоматический расчёт вместо менеджера: подбор параметров смены и техники был на сто процентов ручным, и калькулятор должен был заменить не форму, а человека.',
        'Кран не выбирают перебором. Клиент приходит, зная нагрузку и высоту, — поэтому фильтр должен был говорить параметрами отрасли, а не предлагать категории.',
        'Цена зависит от смены, периода и машины, поэтому калькулятор должен был воспроизвести коммерческие правила, а не умножить дневную ставку.',
        'Заявку отправляют со стройки, с телефона. Это задало ограничения по вёрстке раньше, чем был нарисован дизайн.'],
    },
    case: {
      EN: {
        situation: 'Cranes and hoists were rented with no catalogue a customer could use. To match a machine to a job, or to find out what it cost, you had to call a manager.',
        work: 'Designed and built the rental catalogue from scratch: filters by lifting capacity, lift height and jib radius, and a calculator that prices a shift or a rental period. Made to work on a phone, because enquiries are sent from the job site, not from an office.',
        outcome: 'Enquiry conversion went from 0.8% to 3.2%, and more than 75% of enquiries are now priced by the calculator rather than by a manager.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Технику сдавали без каталога, которым мог бы пользоваться клиент. Чтобы подобрать машину под задачу или узнать цену, нужно было звонить менеджеру.',
        work: 'С нуля спроектировал и разработал каталог аренды: фильтры по грузоподъёмности, высоте подъёма и вылету стрелы, калькулятор стоимости смены и периода аренды. Сделал пригодным для телефона — заявки приходят со стройки, а не из офиса.',
        outcome: 'Конверсия в заявку — с 0.8% до 3.2%, и больше 75% заявок теперь считает калькулятор, а не менеджер.',
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
      { label: { EN: 'Availability at campaign peaks', RU: 'Доступность на пиках акций' },
        before: 91, after: 99.9, unit: '%', better: 'higher',
        note: { EN: 'Peaks used to return 502 and 504', RU: 'На пиках возвращались 502 и 504' } },
      { label: { EN: 'Donation transaction', RU: 'Транзакция пожертвования' },
        before: 13.5, after: 1.8, unit: { EN: 's', RU: 'с' }, better: 'lower',
        displayBefore: { EN: '12-15 s', RU: '12-15 с' }, displayAfter: { EN: '<1.8 s', RU: '<1.8 с' },
        note: { EN: 'A failed donation is a donor who does not retry', RU: 'Сорвавшееся пожертвование — жертвователь, который не повторит' } },
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
      EN: ['Client-server interaction and the payment forms tuned for extreme traffic: peaks had been answering 502 and 504, which means the refusal arrived exactly when a donor was ready to pay.',
        'A foundation raises money in campaigns, so traffic arrives in bursts. The hours when the site is least allowed to fail are exactly the hours it is under most load.',
        'Donation is a payment path in a charity context: a failed transaction is not a lost sale, it is a donor who does not try again.',
        'Two writing systems in one layout, with content maintained in both by non-technical staff.'],
      RU: ['Оптимизация клиент-серверного взаимодействия и платёжных форм под экстремальный трафик: до этого пики отвечали 502 и 504 — то есть отказ приходил ровно в момент, когда жертвователь готов был платить.',
        'Фонд собирает средства кампаниями, поэтому трафик приходит всплесками. Часы, когда сайту меньше всего можно падать, — ровно часы максимальной нагрузки.',
        'Пожертвование — платёжный путь в благотворительном контексте: сорвавшаяся транзакция это не потерянная продажа, а жертвователь, который не попробует снова.',
        'Две письменности в одной вёрстке, и контент в обеих ведут не технические сотрудники.'],
    },
    case: {
      EN: {
        situation: 'A foundation raises money in campaigns, so its traffic arrives in bursts — and those are precisely the hours when the site must not be down.',
        work: 'Built the portal — an online donation module, an events calendar and a news section in both languages — and tuned the client-server interaction and the payment forms for the traffic a campaign brings.',
        outcome: 'Availability at campaign peaks went from about 91% to 99.9%, and a donation transaction from 12-15 seconds to under two.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Фонд собирает средства кампаниями, поэтому трафик приходит всплесками — и именно в эти часы сайт не имеет права лежать.',
        work: 'Разработал портал — модуль онлайн-пожертвований, календарь мероприятий и новостной блок на обоих языках — и оптимизировал клиент-серверное взаимодействие и платёжные формы под трафик, который приносит кампания.',
        outcome: 'Доступность на пиках акций — с ~91% до 99.9%, транзакция пожертвования — с 12-15 секунд до полутора.',
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
      { label: { EN: 'Catalogue and rack configuration load', RU: 'Загрузка каталога и конфигураций стоек' },
        before: 4.2, after: 0.9, unit: { EN: 's', RU: 'с' }, better: 'lower',
        note: { EN: 'Client\u2019s own measurement', RU: 'Замер заказчика' } },
      { label: { EN: 'Configurable in the calculator', RU: 'Настраивается в калькуляторе' },
        delta: { EN: 'Dedicated / VPS, racks and units, bandwidth, Tier III/IV', RU: 'Dedicated / VPS, стойки и юниты, полоса, Tier III/IV' } },
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
      EN: ['Front-end architecture of the B2B catalogue reworked and the rendering of rack slots and units optimised: the configurator rebuilds its output on every change, so that had to be made cheap.',
        'Colocation is priced on a lattice of choices — rack space, power, bandwidth, service tier — and a calculator that lets a buyer assemble an impossible combination costs the sales team more time than it saves.',
        'The buyer is technical and arrives sceptical. The page is read by someone who operates infrastructure for a living, which sets a different bar for both the wording and the load time.'],
      RU: ['Переработка фронтенд-архитектуры B2B-каталога и оптимизация рендеринга стойко-мест и юнитов: конфигуратор перестраивает выдачу на каждое изменение, и это надо было сделать дешёвым.',
        'Колокация считается по решётке выборов — место в стойке, питание, полоса, уровень сервиса, — и калькулятор, позволяющий собрать невозможную комбинацию, отнимает у продаж больше времени, чем экономит.',
        'Покупатель технический и приходит скептиком. Страницу читает человек, который сам эксплуатирует инфраструктуру, — это поднимает планку и к формулировкам, и к скорости загрузки.'],
    },
    case: {
      EN: {
        situation: 'A data centre sells something hard to put on a page: server configurations, colocation, capacity. A static brochure leaves the buyer to work it out.',
        work: 'Built the corporate site with a capacity calculator for dedicated and VPS configurations — rack and unit count, bandwidth, and Tier III/IV service levels — and a quote request flow, so a B2B buyer can price a shape before talking to anyone.',
        outcome: 'The catalogue and rack configurations went from 4.2 seconds to 0.9 — the difference between a technical buyer reading the page and closing it.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'ЦОД продаёт то, что трудно уместить на страницу: конфигурации серверов, размещение, мощности. Статичная брошюра оставляет покупателя разбираться самому.',
        work: 'Сделал корпоративный сайт с калькулятором мощности под Dedicated и VPS — стойки и юниты (U), полоса пропускания, уровни SLA Tier III/IV — и формой запроса коммерческого предложения: B2B-покупатель прикидывает конфигурацию до разговора с менеджером.',
        outcome: 'Каталог и конфигурации стоек — с 4.2 до 0.9 секунды. Это разница между тем, читает технический покупатель страницу или закрывает.',
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
      { label: { EN: 'Request handling time', RU: 'Обработка заявки' },
        before: 300, after: 15, unit: { EN: 'min', RU: 'мин' }, better: 'lower',
        displayBefore: { EN: '4-6 h', RU: '4-6 ч' }, displayAfter: { EN: '15 min', RU: '15 мин' },
        note: { EN: 'Maintenance requests routed by hand before', RU: 'Раньше заявки на ремонт распределяли руками' } },
      { label: { EN: 'Routed automatically', RU: 'Маршрутизируется автоматически' },
        before: 25, after: 85, unit: '%', better: 'higher',
        note: { EN: 'About 75% used to be handled manually', RU: 'Около 75% обрабатывалось вручную' } },
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
      EN: ['End-to-end request handling with automatic routing to contractors: the routing is precisely the step a person used to occupy.',
        'Property management is a queue of small identical requests, each of which used to consume a person. The value was not any single feature but taking the human off the repetitive path.',
        'Money and a credit check in the same flow: two integrations where a failure has consequences beyond an error message.'],
      RU: ['Сквозная система заявок с автоматическим распределением по подрядчикам: маршрутизация — это и есть та часть, где раньше сидел человек.',
        'Управление недвижимостью — очередь мелких одинаковых обращений, каждое из которых съедало человека. Ценность была не в отдельной функции, а в том, чтобы убрать человека с повторяющегося пути.',
        'Деньги и проверка кредитного рейтинга в одном потоке: две интеграции, где сбой имеет последствия за пределами сообщения об ошибке.'],
    },
    case: {
      EN: {
        situation: 'A management company handled tenants by hand: payments, maintenance requests, questions — all of it through a person.',
        work: 'Built the site and the tenant portal end to end: maintenance requests routed automatically to contractors, rent paid online, and a credit check on prospective tenants at application.',
        outcome: 'A request now takes about 15 minutes instead of four to six hours, and roughly 85% is routed automatically where about 75% had been handled by hand.',
        evidence: 'Delivered under contract in 2020; the domain has since been rebuilt on a website builder, so what is there today is not this work.',
      },
      RU: {
        situation: 'Управляющая компания вела жильцов вручную: платежи, заявки на обслуживание, вопросы — всё через человека.',
        work: 'Сделал сайт и личный кабинет жильца сквозной системой: заявки на ремонт с автоматическим распределением по подрядчикам, оплата аренды онлайн, проверка кредитного рейтинга при подаче заявки.',
        outcome: 'Заявка обрабатывается за ~15 минут вместо 4-6 часов, а маршрутизируется автоматически ~85% против ~25% раньше.',
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
      { label: { EN: 'Valid applications per month', RU: 'Валидных заявок в месяц' },
        before: 120, after: 380, better: 'higher',
        displayAfter: { EN: '380+', RU: '380+' },
        note: { EN: 'More than tripled', RU: 'Рост более чем втрое' } },
      { label: { EN: 'Form completion rate', RU: 'Проходимость формы' },
        before: 22, after: 64, unit: '%', better: 'higher',
        note: { EN: 'A single 20-field form was abandoned by ~78%', RU: 'Единую форму на 20+ полей бросали ~78%' } },
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
      EN: ['A stepped wizard in place of one 20-field form: validation as you go, an indicative calculation, and progress kept between visits so an application can be finished rather than restarted.',
        'A leasing calculator is a commercial document in disguise. The numbers it shows set an expectation the sales team then has to honour, so the rules behind it cannot be approximate.',
        'Client documents arriving through a web form raise the bar above a contact form: what is transmitted, where it rests and who can reach it all become design decisions rather than defaults.'],
      RU: ['Пошаговый мастер вместо одной формы на 20+ полей: динамическая валидация, предварительный расчёт условий и сохранение промежуточного прогресса, чтобы заявку можно было дозаполнить, а не начинать заново.',
        'Калькулятор лизинга — коммерческий документ в маскировке. Цифры, которые он показывает, задают ожидание, которое потом придётся выполнять отделу продаж, поэтому правила за ним не могут быть приблизительными.',
        'Документы клиентов, приходящие через веб-форму, поднимают планку выше обычной формы обратной связи: что передаётся, где лежит и кто имеет доступ — становятся проектными решениями, а не настройками по умолчанию.'],
    },
    case: {
      EN: {
        situation: 'A finance company takes client documents through its website, and those are documents with a higher bar than a contact form.',
        work: 'Replaced a single 20-field application form with a stepped wizard: validation as you go, an indicative calculation of terms, and progress kept so an application can be finished later rather than restarted. Alongside it, the leasing calculators and secured forms for submitting financial documents.',
        outcome: 'Applications went from about 120 a month to 380 and above. Form completion rose from 22% to 64% — two thirds of the people who start now reach the end.',
        evidence: UNDER_CONTRACT.EN,
      },
      RU: {
        situation: 'Финансовая компания принимает документы клиентов через сайт, а это документы, к которым требования выше, чем к форме обратной связи.',
        work: 'Заменил единую форму на 20+ полей пошаговым мастером: валидация по ходу, предварительный расчёт условий и сохранение прогресса, чтобы заявку можно было дозаполнить, а не начинать заново. Плюс онлайн-калькуляторы лизинга и защищённые формы отправки финансовых документов.',
        outcome: 'Заявок — со ~120 в месяц до 380 и выше. Проходимость формы выросла с 22% до 64%: две трети начавших теперь доходят до конца.',
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
