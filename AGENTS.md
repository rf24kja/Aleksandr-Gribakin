# Portfolio — Aleksandr Gribakin

## Stack
- Vite + Three.js + GSAP (ScrollTrigger)
- State: custom ESM module (superpowers.state.js)
- Scroll config: PONYTALE config (ponytail.config.js)
- API: serverless function at /api/consult
- Email: Resend → RF24KRSK@gmail.com

## Conventions
- All text goes through PONYTALL.LOCALE[lang] — never hardcode display strings.
- FPS < 45 triggers automatic quality reduction via fx:quality custom event.
- Form action: POST /api/consult with JSON { name, email, message, to: "RF24KRSK@gmail.com" }.
- i18n: data-i18n attributes map to PONYTAIL.LOCALE keys.
- Language toggle: button with data-lang-switch.
- Scroll scenes are defined by range [0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0].
- SEO: structured data in ld-json, hreflang alternates, canonical URL.

## Rules for OpenCode (чтобы не тупить)

### Контекст прежде вопросов
1. **Сначала docs/ — потом пользователь.** Прежде чем задать любой вопрос по задаче — прочитай `docs/superpowers/specs/`, `docs/superpowers/plans/`, `.superpowers/`. Там уже есть ответ.
2. **Сначала конфиги — потом уточнения.** `ponytail.config.js`, `src/themes/themeManager.js` — всегда читай их до вопросов про темы, режимы, сцены.
3. **Если задача звучит знакомо — это спек.** Любая фраза "помнишь задачу?", "как обсуждали", "три дизайна" — сигнал идти в docs/, а не спрашивать.
4. **git log — первым делом.** `git log --oneline -20` показывает что уже сделано. Новые фичи уже могли быть начаты.
5. **Нашёл спек/план — цитируй его.** Не говори "я понял", покажи что прочитал: строка X из спека говорит Y. Пользователь увидит что ты в контексте.
6. **Не задавай вопрос, на который ответ есть в коде или документах.** Если не уверен — проверь файлы, потом спрашивай.
