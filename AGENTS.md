# Portfolio — Aleksandr Gribakin

## Stack
- Vite + Three.js + GSAP (ScrollTrigger)
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

Three.js and the five scene modules are **dynamically imported** and only load
outside business mode — do not add a static `import 'three'` to `src/main.js`.

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

## Rules for OpenCode (чтобы не тупить)

### Контекст прежде вопросов
1. **Сначала docs/ — потом пользователь.** Прежде чем задать любой вопрос по задаче — прочитай `docs/superpowers/specs/`, `docs/superpowers/plans/`, `.superpowers/`. Там уже есть ответ.
2. **Сначала конфиги — потом уточнения.** `ponytail.config.js`, `src/themes/themeManager.js` — всегда читай их до вопросов про темы, режимы, сцены.
3. **Если задача звучит знакомо — это спек.** Любая фраза "помнишь задачу?", "как обсуждали", "три дизайна" — сигнал идти в docs/, а не спрашивать.
4. **git log — первым делом.** `git log --oneline -20` показывает что уже сделано. Новые фичи уже могли быть начаты.
5. **Нашёл спек/план — цитируй его.** Не говори "я понял", покажи что прочитал: строка X из спека говорит Y. Пользователь увидит что ты в контексте.
6. **Не задавай вопрос, на который ответ есть в коде или документах.** Если не уверен — проверь файлы, потом спрашивай.
