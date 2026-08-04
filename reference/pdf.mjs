/**
 * Renders the reference PDF in Russian and English.
 *
 * Chromium prints it, so there is no extra dependency — Playwright is already
 * here for the tests. The print layout is its own thing rather than the web
 * showcase sent to a printer: light ground so it does not drink a cartridge,
 * A4 pages with deliberate breaks, and captions that carry the explanation the
 * hover states cannot.
 *
 *   node reference/pdf.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(HERE, 'screenshots');

const shots = {};
for (const file of await readdir(SHOTS)) {
  if (!file.endsWith('.jpg')) continue;
  const buf = await readFile(join(SHOTS, file));
  shots[file.replace(/\.jpg$/, '')] = `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const COPY = {
  ru: {
    file: 'dev24-portfolio-ru.pdf',
    lang: 'ru',
    title: 'dev24.pro — портфолио в трёх интерфейсах',
    kicker: 'Портфолио · Справочный документ',
    name: 'Александр Грибакин',
    role: 'Senior Full Stack / DevOps Engineer',
    lede: 'Один и тот же материал — карьера, семнадцать проектов, вехи — отдаётся тремя способами: '
      + 'как документ, как рабочий стол и как оболочка. Переключается на месте, выбор запоминается.',
    site: 'dev24.pro',
    mail: 'RF24KRSK@gmail.com',
    factsTitle: 'Коротко',
    facts: [
      ['3', 'режима интерфейса над одним набором данных'],
      ['61', 'адрес в sitemap — у каждого проекта и записи свой URL'],
      ['170', 'автотестов на трёх движках, десктоп и телефон'],
      ['0', 'нарушений контраста в обеих темах'],
    ],
    modes: [
      {
        n: '01', name: 'Business',
        lead: 'Читается как документ. Светлая и тёмная тема, весь текст выше 4.5:1. '
          + 'Содержимое отдаётся в HTML до запуска скриптов, поэтому его видит любой поисковик.',
        shots: [
          ['business-light-intro', 'Главная страница, светлая тема'],
          ['business-light-career', 'Карьерный путь: что было, что сделано, что изменилось'],
          ['business-light-projects', 'Семнадцать проектов с фильтром по направлениям'],
          ['business-light-project', 'Карточка проекта: план запроса до и после индекса'],
          ['business-dark-intro', 'Та же страница в тёмной теме'],
          ['business-light-milestones', 'Вехи и признание'],
        ],
      },
      {
        n: '02', name: 'Desktop',
        lead: 'Оконный менеджер: перетаскивание, свёртка, панель задач. Окна открываются внутри '
          + 'рабочей области и не могут быть утащены за край. Иконки открываются с клавиатуры.',
        shots: [['desktop-windows', 'Рабочий стол с двумя открытыми окнами']],
      },
      {
        n: '03', name: 'Terminal',
        lead: 'Настоящая оболочка: 16 команд, дополнение по Tab, история, интерактивная отправка '
          + 'сообщения. Ширина колонок считается под экран, поэтому выравнивание держится и на телефоне.',
        shots: [
          ['terminal-output', 'Вывод stats и projects, выровненный по колонкам'],
          ['terminal-brief', 'Команда open: справка по проекту'],
        ],
      },
      {
        n: '04', name: 'С телефона',
        lead: 'Все три режима на 390 px. Терминал складывает хром, когда поднимается клавиатура, '
          + 'и отдаёт под вывод 80% окна.',
        phones: [['phone-business', 'Business'], ['phone-desktop', 'Desktop'], ['phone-terminal', 'Terminal']],
      },
    ],
    stackTitle: 'Как сделано',
    stack: 'Vite · Three.js · GSAP · Vercel Edge Functions · Playwright · GitHub Actions',
    note: 'Скриншоты сняты с работающего сайта автоматически, а не нарисованы.',
    contact: 'Связаться',
  },
  en: {
    file: 'dev24-portfolio-en.pdf',
    lang: 'en',
    title: 'dev24.pro — a portfolio in three interfaces',
    kicker: 'Portfolio · Reference document',
    name: 'Aleksandr Gribakin',
    role: 'Senior Full Stack / DevOps Engineer',
    lede: 'One body of material — a career, seventeen projects, milestones — served three ways: '
      + 'as a document, as a desktop, and as a shell. Switched in place, and the choice is remembered.',
    site: 'dev24.pro',
    mail: 'RF24KRSK@gmail.com',
    factsTitle: 'At a glance',
    facts: [
      ['3', 'interfaces over one set of data'],
      ['61', 'URLs in the sitemap — every project and entry has its own'],
      ['170', 'automated tests across three engines, desktop and phone'],
      ['0', 'contrast failures in either theme'],
    ],
    modes: [
      {
        n: '01', name: 'Business',
        lead: 'Reads as a document. Light and dark themes, every piece of text above 4.5:1. '
          + 'The content is in the served HTML before any script runs, so every crawler can read it.',
        shots: [
          ['business-light-intro', 'Home page, light theme'],
          ['business-light-career', 'Career: the situation, the work, and what changed'],
          ['business-light-projects', 'Seventeen projects, filtered by discipline'],
          ['business-light-project', 'A project page: the query plan before and after the index'],
          ['business-dark-intro', 'The same page in the dark theme'],
          ['business-light-milestones', 'Milestones and recognition'],
        ],
      },
      {
        n: '02', name: 'Desktop',
        lead: 'A window manager: dragging, minimise, a taskbar. Windows open inside the work area '
          + 'and cannot be dragged out of reach. Icons open from the keyboard.',
        shots: [['desktop-windows', 'The desktop with two windows open']],
      },
      {
        n: '03', name: 'Terminal',
        lead: 'A real shell: 16 commands, tab completion, history, and an interactive contact flow. '
          + 'Column widths are measured against the window, so the alignment holds on a phone.',
        shots: [
          ['terminal-output', 'stats and projects, aligned in columns'],
          ['terminal-brief', 'The open command: a project brief'],
        ],
      },
      {
        n: '04', name: 'On a phone',
        lead: 'All three modes at 390 px. The terminal collapses its chrome when the keyboard '
          + 'appears and gives 80% of the window to the output.',
        phones: [['phone-business', 'Business'], ['phone-desktop', 'Desktop'], ['phone-terminal', 'Terminal']],
      },
    ],
    stackTitle: 'Built with',
    stack: 'Vite · Three.js · GSAP · Vercel Edge Functions · Playwright · GitHub Actions',
    note: 'Screenshots are captured from the running site automatically, not mocked up.',
    contact: 'Contact',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function page(c) {
  const shotBlock = (list) => list.map(([name, caption]) => `
      <figure>
        <img src="${shots[name]}" alt="${esc(caption)}" />
        <figcaption>${esc(caption)}</figcaption>
      </figure>`).join('');

  return `<!doctype html>
<html lang="${c.lang}">
<head><meta charset="utf-8"><title>${esc(c.title)}</title>
<style>
  @page { size: A4; margin: 14mm 13mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #14191b; background: #fff;
    font-family: "Segoe UI", "Noto Sans", Arial, sans-serif;
    font-size: 10.5pt; line-height: 1.55;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  h1, h2, h3 { margin: 0; }
  img { display: block; width: 100%; height: auto; border: 1px solid #dfe4e2; border-radius: 3px; }
  figure { margin: 0 0 9mm; break-inside: avoid; }
  figcaption {
    font-family: Consolas, "Courier New", monospace;
    font-size: 8pt; color: #5d6a65; margin-top: 2.5mm;
  }
  .kicker {
    font-family: Consolas, "Courier New", monospace;
    font-size: 8pt; letter-spacing: .18em; text-transform: uppercase;
    color: #b8430f; margin-bottom: 6mm;
  }

  /* cover */
  .cover { height: 247mm; display: flex; flex-direction: column; justify-content: space-between; break-after: page; }
  .cover h1 { font-size: 34pt; line-height: 1.02; letter-spacing: -.02em; font-weight: 700; }
  .cover .role { font-size: 13pt; color: #55625c; margin-top: 3mm; }
  .cover .lede { font-size: 11.5pt; color: #33403a; max-width: 150mm; margin-top: 8mm; }
  .cover .links { font-family: Consolas, "Courier New", monospace; font-size: 10pt; }
  .cover .links a { color: #b8430f; text-decoration: none; }
  .cover-shot { margin-top: 9mm; }
  .cover-shot img { border-color: #cfd6d3; }

  /* facts */
  .facts { display: flex; flex-wrap: wrap; gap: 4mm; margin: 7mm 0 0; }
  .fact {
    flex: 1 1 38mm; border: 1px solid #e2e7e5; border-radius: 3px;
    padding: 4mm 4mm 4.5mm;
  }
  .fact b { display: block; font-family: Consolas, "Courier New", monospace; font-size: 19pt; line-height: 1; }
  .fact span { display: block; font-size: 8.5pt; color: #55625c; margin-top: 2mm; }

  /* chapters */
  section { break-before: page; }
  .head { display: flex; gap: 6mm; align-items: baseline; border-bottom: 1px solid #e2e7e5; padding-bottom: 4mm; margin-bottom: 7mm; }
  .head .n { font-family: Consolas, "Courier New", monospace; font-size: 20pt; color: #c8d1cd; }
  .head h2 { font-size: 17pt; letter-spacing: -.01em; }
  .head p { margin: 2mm 0 0; color: #4a5751; max-width: 150mm; }
  .phones { display: flex; gap: 5mm; }
  .phones figure { flex: 1; }

  footer { break-before: page; }
  .sig { border-top: 1px solid #e2e7e5; padding-top: 6mm; margin-top: 8mm; }
  .sig p { margin: 0 0 2mm; }
  .mono { font-family: Consolas, "Courier New", monospace; font-size: 9pt; color: #55625c; }
</style></head>
<body>

<div class="cover">
  <div>
    <p class="kicker">${esc(c.kicker)}</p>
    <h1>${esc(c.name)}</h1>
    <p class="role">${esc(c.role)}</p>
    <p class="lede">${esc(c.lede)}</p>
    <div class="cover-shot"><img src="${shots['business-light-intro']}" alt="${esc(c.name)} — ${esc(c.site)}" /></div>
  </div>
  <p class="links"><a href="https://dev24.pro">${esc(c.site)}</a> · <a href="mailto:${c.mail}">${esc(c.mail)}</a></p>
</div>

<section>
  <div class="head">
    <div class="n">—</div>
    <div><h2>${esc(c.factsTitle)}</h2></div>
  </div>
  <div class="facts">
    ${c.facts.map(([n, t]) => `<div class="fact"><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join('\n    ')}
  </div>
  <p class="mono" style="margin-top:7mm">${esc(c.note)}</p>
</section>

${c.modes.map((m) => `<section>
  <div class="head">
    <div class="n">${esc(m.n)}</div>
    <div><h2>${esc(m.name)}</h2><p>${esc(m.lead)}</p></div>
  </div>
  ${m.phones
    ? `<div class="phones">${m.phones.map(([name, cap]) => `<figure><img src="${shots[name]}" alt="${esc(cap)}" /><figcaption>${esc(cap)}</figcaption></figure>`).join('')}</div>`
    : shotBlock(m.shots)}
</section>`).join('\n')}

<footer>
  <div class="head">
    <div class="n">—</div>
    <div><h2>${esc(c.stackTitle)}</h2></div>
  </div>
  <p class="mono">${esc(c.stack)}</p>
  <div class="sig">
    <p class="kicker" style="margin-bottom:3mm">${esc(c.contact)}</p>
    <p><a href="https://dev24.pro" style="color:#b8430f;text-decoration:none">${esc(c.site)}</a></p>
    <p><a href="mailto:${c.mail}" style="color:#b8430f;text-decoration:none">${esc(c.mail)}</a></p>
  </div>
</footer>

</body></html>`;
}

const browser = await chromium.launch();
for (const key of ['ru', 'en']) {
  const c = COPY[key];
  const html = page(c);
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.emulateMedia({ media: 'print' });
  await p.evaluate(() => document.fonts?.ready);
  await p.pdf({
    path: join(HERE, c.file),
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="width:100%;font-size:7pt;color:#8b968f;font-family:Consolas,monospace;'
      + 'padding:0 13mm;display:flex;justify-content:space-between;">'
      + '<span>dev24.pro</span><span class="pageNumber"></span></div>',
    margin: { top: '14mm', right: '13mm', bottom: '16mm', left: '13mm' },
  });
  // The print source is kept beside the PDF: it is what a reviewer opens to
  // check the layout, and what regenerates the file if a detail needs changing.
  await writeFile(join(HERE, `print-${key}.html`), html, 'utf8');
  await ctx.close();
  const size = (await readFile(join(HERE, c.file))).length;
  console.log(`${c.file} — ${Math.round(size / 1024)} KB`);
}
await browser.close();
await writeFile(join(HERE, '.gitattributes'), '*.pdf binary\n*.jpg binary\n', 'utf8');
