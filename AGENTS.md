# Portfolio — Aleksandr Gribakin

## Stack
- Vite + GSAP (ScrollTrigger). No framework, no WebGL.
- State: custom ESM module (`src/core/superpowers.state.js`)
- Config + copy: `PONYTAIL` in `src/config/ponytail.config.js`
- API: Vercel Edge function at `/api/consult`
- Email: Resend → RF24KRSK@gmail.com

## Modes
Three interfaces switched by `data-mode` on `<html>` (`src/themes/themeManager.js`):
`business` (default, no WebGL), `desktop` (window manager), `terminal`.
`business` additionally supports `data-theme="dark|light"`. A stored choice wins;
otherwise `prefers-color-scheme` decides and keeps deciding, so the resolved
theme is only written to `localStorage` when the visitor picks it themselves.
The inline script in `<head>` settles this before the first paint — keep the two
copies of the rule (there and in `src/main.js`) in agreement.

There is no 3D. All three modes hid `canvas#webgl` in CSS, so Three.js, the five
scene modules, the render loop and the FPS-budget machinery that fed them never
ran for a single visitor; they are gone, along with a hidden portrait image that
every visit downloaded at high priority. Do not reintroduce a renderer without
first making a mode that actually shows the canvas.

## Statistics
- **All headline numbers are computed, never typed in.** `src/lib/stats.js`
  derives them from `PROJECTS`, `CAREER`, `PROJECTS_DETAIL` and `ACHIEVEMENTS`.
  There is no `STATS` array — only `STATS_LABELS` wording in the locale.
  Add a project and the counts, tech frequencies and peak throughput follow.
- `parseMetric()` turns a `{ label, value, unit }` highlight into a comparable
  magnitude (unit family, SI/byte multiplier, per-second normalisation,
  higher/lower-is-better direction). `buildMetricScale()` collects the
  portfolio-wide range per family; `scoreMetric()` positions one metric on it.
- Chart bars mean something specific: percentages are true gauges, everything
  else is log-scaled against comparable metrics across all projects, flipped
  for lower-is-better. Never reintroduce `min(round(value), 100)`.
- `src/lib/statsUI.js` renders; `stats.js` never touches the DOM.
- Unit strings drive classification. When adding a metric, keep the unit
  parseable (`K TPS`, `ms`, `TB/day`, `%`, `$B+`) and keep the EN and RU
  entries in the same order with the same numeric values.

## Conventions
- All text goes through `PONYTAIL.LOCALE[lang]` — never hardcode display strings.
- FPS < 45 triggers automatic quality reduction via the `fx:quality` event.
  Its payload key is `detail.quality`, not `detail.level`.
- Form action: `POST /api/consult` with `{ name, email, message }`. The
  recipient is a server-side constant; anything in the body is ignored.
- i18n: `data-i18n` attributes map to `PONYTAIL.LOCALE` keys.
- Language toggle: button with `data-lang-switch`.
- `[data-scroll-to]` has exactly one handler, in `orchestrator._wireHashRouter`.
- Clickable cards are `<button>`s, so their children must be phrasing content
  (`<span>`, not `<div>`/`<h3>`).
- Scroll scenes are defined by range [0-0.18, 0.18-0.35, 0.35-0.62, 0.62-0.80, 0.80-1.0].
- SEO: structured data in ld-json, hreflang alternates, canonical URL,
  `og-cover.jpg` (1200×630) for social previews.
- Secrets live in env vars only (`.env.example` lists them). Nothing with a
  token goes in the repo.
- Fonts are served from this origin. `public/fonts/` and the `@font-face` block
  between the `fonts:start` / `fonts:end` markers in `index.html` are written by
  `npm run fonts` — edit the family list in `scripts/fonts.mjs`, never the block.
  Nothing on the render path may point at another host: a test asserts it.

## Analytics
Three counters, all through `src/lib/analytics.js` — nothing else may call
`ym`, `gtag` or `va` directly. Ids come from the `yandex-metrica` and
`google-analytics` meta tags in `index.html`; empty means that counter is not
loaded at all. Vercel needs no id, only its project toggle.

This is a single-page site, so a pageview is a decision, not an event: Metrica
is initialised with `defer: true` and GA4 with `send_page_view: false`, and
`trackPage()` is the only thing that reports one. It de-duplicates by URL
because the app rewrites the address with `replaceState` on boot.

`trackEvent('consult')` fires on a successful send and nowhere else — never on
the submit click. Both the business form and the terminal's `contact` flow
report it, and both report `consult_failed` when delivery fails.

`src/lib/attribution.js` captures the campaign parameters at arrival, because
`_routeFromPath()` replaces the address — query string included — as soon as it
resolves a prerendered URL. `captureAttribution()` must therefore stay at the
top of `src/main.js`, ahead of the orchestrator. Both submit paths attach
`attribution()` as `source`, and `api/consult.js` whitelists the keys again
before they reach the email.

## Rules for OpenCode (чтобы не тупить)

### Контекст прежде вопросов
1. **Сначала docs/ — потом пользователь.** Прежде чем задать любой вопрос по задаче — прочитай `docs/superpowers/specs/`, `docs/superpowers/plans/`, `.superpowers/`. Там уже есть ответ.
2. **Сначала конфиги — потом уточнения.** `ponytail.config.js`, `src/themes/themeManager.js` — всегда читай их до вопросов про темы, режимы, сцены.
3. **Если задача звучит знакомо — это спек.** Любая фраза "помнишь задачу?", "как обсуждали", "три дизайна" — сигнал идти в docs/, а не спрашивать.
4. **git log — первым делом.** `git log --oneline -20` показывает что уже сделано. Новые фичи уже могли быть начаты.
5. **Нашёл спек/план — цитируй его.** Не говори "я понял", покажи что прочитал: строка X из спека говорит Y. Пользователь увидит что ты в контексте.
6. **Не задавай вопрос, на который ответ есть в коде или документах.** Если не уверен — проверь файлы, потом спрашивай.
