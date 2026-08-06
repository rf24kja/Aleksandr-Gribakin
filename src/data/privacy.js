/**
 * The privacy policy, as data rather than a page of markup.
 *
 * Structured because it is rendered three ways — a document in business, a
 * window in desktop, and printed text in the terminal — and a policy that says
 * something slightly different depending on which interface you opened would be
 * worse than none.
 *
 * The content is deliberately specific rather than boilerplate: it lists what
 * this site actually collects and stores, which is knowable exactly, because
 * every one of those calls is in this repository. Two consequences worth
 * keeping in mind when editing:
 *
 *   - Yandex.Metrica is absent because it is not connected. When the counter is
 *     added, this file must be updated in the same deploy. A policy that omits
 *     a live tracker is worse than no policy.
 *   - The storage keys below are the real ones. If a key is renamed in the app,
 *     rename it here too.
 */

export const PRIVACY_UPDATED = '2026-08-07';

export const PRIVACY = {
  EN: {
    title: 'Privacy Policy',
    updated: 'Last updated: 7 August 2026',
    intro: 'This site is a personal portfolio. It collects as little as it can, and this page says exactly what that is.',
    sections: [
      {
        h: 'Who handles your data',
        p: ['Aleksandr Gribakin, owner of dev24.pro. For any question about this policy: hello@dev24.pro.'],
      },
      {
        h: 'What the contact form sends',
        p: [
          'When you send a message, three things you typed are transmitted: your name, your email address and the message itself.',
          'Alongside them go the interface language you were using, the time of sending, and — if you arrived from an advert — the campaign labels in that link: utm_source, utm_medium, utm_campaign, utm_content, utm_term, yclid, gclid, fbclid, the page you landed on and the site you came from.',
          'Your IP address is used only to limit how often messages can be sent, and is held in the server\'s memory for about a minute. It is not written to any database or file.',
        ],
      },
      {
        h: 'Where it goes',
        list: [
          'Resend — the mail service that delivers the message to my inbox.',
          'Vercel — the hosting for this site; its technical access logs are produced on its side.',
          'There is no enquiries database: the message lives in my mailbox and nowhere else.',
        ],
      },
      {
        h: 'What is stored in your browser',
        p: ['Not for tracking, but so the site remembers what you chose:'],
        list: [
          'portfolio-mode — the interface you picked',
          'portfolio-lang — the language',
          'theme — light or dark',
          'terminal-history — your command history in terminal mode',
          'attribution — the campaign labels, kept only until the tab is closed',
        ],
        after: ['All of it can be removed by clearing this site\'s data in your browser.'],
      },
      {
        h: 'Analytics',
        list: [
          'Google Analytics 4 — anonymised visit statistics; it sets its own cookies (_ga and related).',
          'Vercel Web Analytics — visit statistics without cookies.',
        ],
        after: ['You can opt out with a blocker or by refusing third-party cookies. The site keeps working either way.'],
      },
      {
        h: 'How long it is kept',
        p: [
          'Correspondence: for as long as I need it to deal with your enquiry, and no longer than three years.',
          'Analytics data: according to the retention periods of the services above.',
        ],
      },
      {
        h: 'Your rights',
        p: ['You can ask what data of yours I hold, ask for it to be corrected or deleted, and withdraw your consent. Write to hello@dev24.pro and I will answer within 30 days.'],
      },
      {
        h: 'Changes',
        p: ['If what is collected changes — another analytics service, for instance — this page is updated and the date at the top changes with it.'],
      },
    ],
  },

  RU: {
    title: 'Политика конфиденциальности',
    updated: 'Обновлено: 7 августа 2026',
    intro: 'Это персональный сайт-портфолио. Он собирает минимум, и на этой странице написано, что именно.',
    sections: [
      {
        h: 'Кто обрабатывает данные',
        p: ['Александр Грибакин, владелец сайта dev24.pro. По любым вопросам об этой политике: hello@dev24.pro.'],
      },
      {
        h: 'Что отправляет форма',
        p: [
          'Когда вы отправляете сообщение, передаётся то, что вы ввели сами: имя, адрес электронной почты и текст сообщения.',
          'Вместе с ними уходят выбранный язык интерфейса, время отправки и — если вы пришли по рекламной ссылке — метки кампании из неё: utm_source, utm_medium, utm_campaign, utm_content, utm_term, yclid, gclid, fbclid, адрес страницы входа и адрес сайта, с которого вы перешли.',
          'IP-адрес используется только для ограничения частоты отправок и удерживается в памяти сервера около минуты. В базу или файл он не записывается.',
        ],
      },
      {
        h: 'Куда это попадает',
        list: [
          'Resend — почтовый сервис, через который сообщение приходит на мой ящик.',
          'Vercel — хостинг сайта; технические журналы обращений формируются на его стороне.',
          'Базы обращений у сайта нет: сообщение живёт в моей почте и больше нигде.',
        ],
      },
      {
        h: 'Что хранится в вашем браузере',
        p: ['Не для слежки, а чтобы сайт помнил ваш выбор:'],
        list: [
          'portfolio-mode — выбранный интерфейс',
          'portfolio-lang — язык',
          'theme — светлая или тёмная тема',
          'terminal-history — история команд в терминальном режиме',
          'attribution — метки рекламной кампании; хранится только до закрытия вкладки',
        ],
        after: ['Всё это удаляется очисткой данных сайта в браузере.'],
      },
      {
        h: 'Аналитика',
        list: [
          'Google Analytics 4 — обезличенная статистика посещений; ставит собственные файлы cookie (_ga и производные).',
          'Vercel Web Analytics — статистика посещений без файлов cookie.',
        ],
        after: ['Отказаться можно блокировщиком или запретом сторонних cookie. Сайт продолжит работать.'],
      },
      {
        h: 'Сколько хранится',
        p: [
          'Переписка — пока она нужна мне для работы с обращением, и не дольше трёх лет.',
          'Данные аналитики — по срокам соответствующих сервисов.',
        ],
      },
      {
        h: 'Ваши права',
        p: ['Вы можете запросить, какие ваши данные у меня есть, потребовать их исправления или удаления и отозвать согласие. Напишите на hello@dev24.pro — отвечу в течение 30 дней.'],
      },
      {
        h: 'Изменения',
        p: ['Если состав собираемых данных изменится — например, добавится другой сервис аналитики, — эта страница будет обновлена, а дата вверху изменится вместе с ней.'],
      },
    ],
  },
};

/** Flattened to plain lines — what the terminal and the prerenderer both want. */
export function privacyLines(lang = 'EN') {
  const doc = PRIVACY[lang === 'RU' ? 'RU' : 'EN'];
  const out = [];
  for (const s of doc.sections) {
    out.push({ head: s.h });
    for (const p of s.p || []) out.push({ text: p });
    for (const li of s.list || []) out.push({ text: li, bullet: true });
    for (const p of s.after || []) out.push({ text: p });
  }
  return out;
}
