/**
 * Builds the showcase page with every screenshot inlined as a data URI.
 *
 * A published artifact may not fetch from another host, so nothing can be
 * linked — the images have to travel inside the document.
 *
 *   node reference/build.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(HERE, 'screenshots');

const shots = {};
for (const file of await readdir(SHOTS)) {
  if (!file.endsWith('.jpg')) continue;
  const buf = await readFile(join(SHOTS, file));
  shots[file.replace(/\.jpg$/, '')] = `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const img = (name, alt, cls = '') =>
  `<img class="${cls}" src="${shots[name]}" alt="${alt}" loading="lazy" decoding="async" />`;

const MODES = [
  {
    id: 'business',
    n: '01',
    name: 'Business',
    lead: 'Читается как документ. Светлая и тёмная тема, весь текст выше 4.5:1.',
    shots: [
      ['business-light-intro', 'Главная страница в светлой теме'],
      ['business-light-career', 'Карьерный путь: пять записей с описанием работы'],
      ['business-light-projects', 'Сетка из семнадцати проектов с фильтром по направлениям'],
      ['business-light-project', 'Карточка проекта: план запроса до и после индекса'],
      ['business-dark-intro', 'Та же страница в тёмной теме'],
      ['business-light-milestones', 'Вехи и признание'],
    ],
  },
  {
    id: 'desktop',
    n: '02',
    name: 'Desktop',
    lead: 'Оконный менеджер: перетаскивание, свёртка, панель задач. Иконки открываются с клавиатуры.',
    shots: [['desktop-windows', 'Рабочий стол с двумя открытыми окнами']],
  },
  {
    id: 'terminal',
    n: '03',
    name: 'Terminal',
    lead: 'Настоящая оболочка: 16 команд, дополнение по Tab, история. Колонки считаются под ширину экрана.',
    shots: [
      ['terminal-output', 'Вывод команд stats и projects, выровненный по колонкам'],
      ['terminal-brief', 'Команда open: справка по проекту с артефактом'],
    ],
  },
];

const FACTS = [
  ['3', 'режима интерфейса', 'над одним набором данных'],
  ['61', 'адрес в sitemap', 'у каждого проекта и записи свой URL'],
  ['170', 'автотестов', 'три движка, десктоп и телефон'],
  ['0', 'нарушений контраста', 'обе темы, весь текст'],
];

const html = `<title>dev24.pro — портфолио в трёх интерфейсах</title>
<style>
  :root {
    /* Sampled from the site itself rather than chosen in the abstract: the
       near-black carries a green bias from the terminal, and the orange is the
       accent the business mode already uses. */
    --ink: #0b0d0c;
    --surface: #131715;
    --raised: #1a201d;
    --line: #263029;
    --text: #e7ece9;
    --muted: #94a09a;
    --accent: #ff6a35;
    --term: #00ff41;
    --shadow: 0 30px 80px -30px rgba(0,0,0,.85);

    --sans: ui-sans-serif, "Segoe UI Variable Display", "Segoe UI", Roboto, system-ui, sans-serif;
    --mono: ui-monospace, "JetBrains Mono", "Cascadia Mono", Consolas, "Liberation Mono", monospace;
    --measure: 62ch;
  }
  @media (prefers-color-scheme: light) {
    :root {
      --ink: #f6f8f7; --surface: #fff; --raised: #f0f3f1;
      --line: #dde4e0; --text: #101613; --muted: #5a665f;
      --accent: #b8430f; --term: #0b6b28;
      --shadow: 0 24px 60px -28px rgba(16,22,19,.28);
    }
  }
  :root[data-theme="light"] {
    --ink: #f6f8f7; --surface: #fff; --raised: #f0f3f1;
    --line: #dde4e0; --text: #101613; --muted: #5a665f;
    --accent: #b8430f; --term: #0b6b28;
    --shadow: 0 24px 60px -28px rgba(16,22,19,.28);
  }
  :root[data-theme="dark"] {
    --ink: #0b0d0c; --surface: #131715; --raised: #1a201d;
    --line: #263029; --text: #e7ece9; --muted: #94a09a;
    --accent: #ff6a35; --term: #00ff41;
    --shadow: 0 30px 80px -30px rgba(0,0,0,.85);
  }

  body {
    margin: 0;
    background: var(--ink);
    color: var(--text);
    font-family: var(--sans);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 0 clamp(18px, 4vw, 44px); }
  img { display: block; max-width: 100%; height: auto; }

  .eyebrow {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 14px;
  }

  /* ---- hero ------------------------------------------------------------- */
  header { padding: clamp(56px, 9vw, 120px) 0 clamp(28px, 4vw, 48px); }
  h1 {
    font-size: clamp(38px, 7.2vw, 88px);
    line-height: .98;
    letter-spacing: -.035em;
    font-weight: 680;
    margin: 0 0 20px;
    text-wrap: balance;
  }
  h1 .thin { font-weight: 200; color: var(--muted); display: block; }
  .lede {
    max-width: var(--measure);
    font-size: clamp(16px, 1.9vw, 21px);
    color: var(--muted);
    margin: 0 0 30px;
  }
  .cta {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--mono); font-size: 14px; letter-spacing: .04em;
    color: var(--ink); background: var(--accent);
    padding: 14px 24px; border-radius: 999px;
    text-decoration: none; font-weight: 600;
    transition: transform .2s ease;
  }
  :root[data-theme="dark"] .cta, :root:not([data-theme]) .cta { color: #10130f; }
  @media (prefers-color-scheme: light) { :root:not([data-theme]) .cta { color: #fff; } }
  :root[data-theme="light"] .cta { color: #fff; }
  .cta:hover { transform: translateY(-2px); }
  .cta:focus-visible { outline: 3px solid var(--text); outline-offset: 3px; }

  /* ---- the switcher: the showcase behaves like the thing it shows -------- */
  .switch { margin: clamp(34px, 6vw, 64px) 0 0; }
  /* Hidden but focusable. As opacity:0 with pointer-events:none the radios left
     the labels as the only target, and a label with tabindex takes focus but
     does not respond to Space — the switcher was mouse-only. Kept in the
     accessibility tree, so arrow keys move through the group natively. */
  .switch input {
    position: absolute; width: 1px; height: 1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap;
  }
  .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
  .tabs label {
    font-family: var(--mono); font-size: 13px; letter-spacing: .06em;
    padding: 11px 20px; border: 1px solid var(--line); border-radius: 999px;
    color: var(--muted); cursor: pointer; user-select: none;
    transition: color .18s, border-color .18s, background .18s;
    min-height: 44px; display: inline-flex; align-items: center;
  }
  .tabs label:hover { color: var(--text); border-color: var(--muted); }
  .frame {
    position: relative;
    border: 1px solid var(--line); border-radius: 14px; overflow: hidden;
    background: var(--surface); box-shadow: var(--shadow);
    aspect-ratio: 1280 / 800;
  }
  .frame > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .45s ease; }
  #m-business:checked ~ .frame > [data-pane="business"],
  #m-desktop:checked  ~ .frame > [data-pane="desktop"],
  #m-terminal:checked ~ .frame > [data-pane="terminal"] { opacity: 1; }
  #m-business:checked ~ .tabs [for="m-business"],
  #m-desktop:checked  ~ .tabs [for="m-desktop"],
  #m-terminal:checked ~ .tabs [for="m-terminal"] {
    color: var(--accent); border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  /* The focus ring belongs on the label, since the input it describes is
     off-screen by design. */
  #m-business:focus-visible ~ .tabs [for="m-business"],
  #m-desktop:focus-visible  ~ .tabs [for="m-desktop"],
  #m-terminal:focus-visible ~ .tabs [for="m-terminal"] {
    outline: 3px solid var(--accent); outline-offset: 3px;
  }
  .caption { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 12px; }

  /* ---- facts ------------------------------------------------------------ */
  .facts {
    display: grid; gap: 1px; background: var(--line);
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
    margin: clamp(56px, 9vw, 110px) 0;
  }
  .fact { background: var(--ink); padding: 26px 22px; }
  .fact b {
    display: block; font-family: var(--mono); font-size: clamp(30px, 4vw, 44px);
    font-weight: 600; letter-spacing: -.03em; color: var(--text); line-height: 1;
  }
  .fact span { display: block; margin-top: 8px; font-size: 14px; }
  .fact span:last-child { color: var(--muted); font-size: 13px; }

  /* ---- mode chapters ---------------------------------------------------- */
  section.mode { padding: clamp(48px, 8vw, 96px) 0; border-top: 1px solid var(--line); }
  .mode-head { display: flex; gap: clamp(16px, 3vw, 40px); align-items: baseline; flex-wrap: wrap; margin-bottom: 30px; }
  .mode-n { font-family: var(--mono); font-size: clamp(30px, 5vw, 52px); color: var(--line); font-weight: 600; line-height: 1; }
  :root[data-theme="light"] .mode-n { color: #c9d2cc; }
  h2 { font-size: clamp(26px, 3.6vw, 42px); letter-spacing: -.03em; margin: 0 0 10px; font-weight: 640; }
  .mode-head p { margin: 0; color: var(--muted); max-width: var(--measure); }
  .mode-head .txt { flex: 1 1 420px; }

  .grid { display: grid; gap: clamp(14px, 2vw, 22px); grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); }
  figure { margin: 0; }
  figure img { border: 1px solid var(--line); border-radius: 10px; background: var(--surface); box-shadow: var(--shadow); }
  figcaption { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 10px; letter-spacing: .02em; }
  .span-2 { grid-column: 1 / -1; }
  section.mode[data-mode="terminal"] figcaption { color: var(--term); }

  /* ---- phones ----------------------------------------------------------- */
  .phones { display: grid; gap: clamp(16px, 3vw, 34px); grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); align-items: start; }
  .phones img { border-radius: 22px; border: 1px solid var(--line); box-shadow: var(--shadow); }

  footer { border-top: 1px solid var(--line); padding: clamp(48px, 8vw, 88px) 0 clamp(56px, 9vw, 96px); }
  footer a { color: var(--accent); }
  .foot-row { display: flex; gap: 28px; flex-wrap: wrap; align-items: center; justify-content: space-between; }
  .stack { font-family: var(--mono); font-size: 12.5px; color: var(--muted); letter-spacing: .04em; }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
  }
</style>

<div class="wrap">
  <header>
    <p class="eyebrow">Портфолио · dev24.pro</p>
    <h1>Александр Грибакин<span class="thin">один сайт, три интерфейса</span></h1>
    <p class="lede">
      Senior Full Stack / DevOps. Один и тот же материал — карьера, семнадцать проектов,
      вехи — отдаётся тремя способами: как документ, как рабочий стол и как оболочка.
      Переключается на месте.
    </p>
    <a class="cta" href="https://dev24.pro" target="_blank" rel="noopener">Открыть сайт →</a>

    <div class="switch">
      <input type="radio" name="mode" id="m-business" checked />
      <input type="radio" name="mode" id="m-desktop" />
      <input type="radio" name="mode" id="m-terminal" />
      <div class="tabs" role="group" aria-label="Режим интерфейса">
        <label for="m-business">01 · Business</label>
        <label for="m-desktop">02 · Desktop</label>
        <label for="m-terminal">03 · Terminal</label>
      </div>
      <div class="frame">
        <img data-pane="business" src="${shots['business-light-intro']}" alt="Business mode" />
        <img data-pane="desktop" src="${shots['desktop-windows']}" alt="Desktop mode" />
        <img data-pane="terminal" src="${shots['terminal-output']}" alt="Terminal mode" />
      </div>
      <p class="caption">Тот же переключатель есть и на самом сайте — выбор запоминается.</p>
    </div>
  </header>

  <div class="facts">
    ${FACTS.map(([n, a, b]) => `<div class="fact"><b>${n}</b><span>${a}</span><span>${b}</span></div>`).join('\n    ')}
  </div>

  ${MODES.map((m) => `<section class="mode" data-mode="${m.id}">
    <div class="mode-head">
      <div class="mode-n">${m.n}</div>
      <div class="txt">
        <h2>${m.name}</h2>
        <p>${m.lead}</p>
      </div>
    </div>
    <div class="grid">
      ${m.shots.map(([name, alt], i) => `<figure${m.shots.length === 1 || (m.shots.length % 2 === 1 && i === 0) ? ' class="span-2"' : ''}>
        ${img(name, alt)}
        <figcaption>${alt}</figcaption>
      </figure>`).join('\n      ')}
    </div>
  </section>`).join('\n\n  ')}

  <section class="mode">
    <div class="mode-head">
      <div class="mode-n">04</div>
      <div class="txt">
        <h2>С телефона</h2>
        <p>Все три режима на 390 px. Терминал складывает хром, когда поднимается клавиатура, и отдаёт под вывод 80% окна.</p>
      </div>
    </div>
    <div class="phones">
      <figure>${img('phone-business', 'Business на телефоне')}<figcaption>Business</figcaption></figure>
      <figure>${img('phone-desktop', 'Desktop на телефоне')}<figcaption>Desktop</figcaption></figure>
      <figure>${img('phone-terminal', 'Terminal на телефоне')}<figcaption>Terminal</figcaption></figure>
    </div>
  </section>

  <footer>
    <div class="foot-row">
      <div>
        <p class="eyebrow">Связаться</p>
        <p style="margin:0"><a href="https://dev24.pro" target="_blank" rel="noopener">dev24.pro</a> · <a href="mailto:RF24KRSK@gmail.com">RF24KRSK@gmail.com</a></p>
      </div>
      <p class="stack">Vite · Three.js · GSAP · Vercel Edge · Playwright</p>
    </div>
  </footer>
</div>
`;

await writeFile(join(HERE, 'showcase.html'), html, 'utf8');
const kb = Math.round(Buffer.byteLength(html) / 1024);
console.log(`reference/showcase.html — ${kb} KB, ${Object.keys(shots).length} screenshots inlined`);
