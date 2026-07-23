# Business Mode — Minimalist Redesign

## Concept

Полный редизайн скролл-портфолио. Минимализм: чистый фон, крупная типографика, никакого 3D, контент — на первом плане.

## Эстетика

- **Фон**: светлый (`#fafafa`) или тёмный (`#111`) — переключается
- **Акцент**: `#e95420` (Ubuntu orange) — единый цвет акцента во всех режимах
- **Типографика**: `'Inter', system-ui, sans-serif` — тонкие начертания (300/400/600)
- **Заголовки секций**: 11–14px, uppercase, широкий letter-spacing, цвет акцента
- **Контент**: 15–18px, межстрочный 1.7, максимум 700px ширина
- **Никаких**: 3D-сцен, блюма, scanlines, FPS-счётчика, preloader-анимаций

## Структура (секции)

1. **Intro** — имя, роль, теги (Go, Rust, Python, K8s...), краткое био, CTA "Initiate Consult"
2. **Stats** — 4 ключевые метрики крупными цифрами
3. **Career** — таймлайн: компания, период, роль, описание
4. **Projects** — сетка карточек с категориями (фильтр табами)
5. **Achievements** — список достижений с годом
6. **Contact** — форма отправки сообщения

## Технические изменения

### Удалить (из Business mode):
- Three.js render loop (`src/main.js` — renderer, composer, scene, camera)
- `src/scenes/` — 5 файлов сцен
- `src/core/SceneManager.js`
- Все эффекты: bloom, fog, parallax
- Интро-анимацию с портретом (cinematic reveal)
- Preloader (мгновенная загрузка)
- `#portrait-wrap`, `#scanlines`, `#fpsCounter`, `#preloader`, `#coffeeEgg`
- GSAP ScrollTrigger — упростить (только opacity reveal, без сложных трансформ)
- Кнопки тем (4 → 1 business theme)

### Оставить:
- `PONYTAIL.LOCALE` — весь контент
- Форма `/api/consult`
- `orchestrator.js` — логика проектов, карьеры, достижений (упростить)
- GSAP — только fade-in/reveal

### Переписать:
- `src/main.js` — убрать Three.js, упростить scroll-логику
- `index.html CSS` — убрать все стили 3D/тем, написать чистый минималистичный CSS
- `src/core/orchestrator.js` — убрать 3D-зависимости, hover-эффекты

## Визуальный стиль

### Intro
- Имя: 48px `font-weight: 200`, акцентный символ перед именем
- Роль: 16px, `opacity: .6`
- Стек тегов: маленькие rounded rectangles
- CTA: обведённая кнопка с акцентной рамкой

### Stats
- 4 колонки, каждая: число (32px `font-weight: 300`), подпись (11px uppercase)
- Появляются при скролле (GSAP fade-in + slide-up)

### Career
- Таймлайн: левая линия с точками, справа — компания/роль/период/описание
- Чередование: чётные элементы слегка смещены

### Projects
- Сетка 2-3 колонки
- Категории: табы (All, Fintech, ML/AI, Infrastructure, Open Source, Web3, Platform)
- Карточка: название, категория, краткое описание, стек (тегами)

### Achievements
- Простой список: год слева, заголовок справа, описание ниже

### Contact
- Минимальная форма: name, email, message, submit
- Никаких стилей terminal

## Файлы

- `index.html` — обновить CSS (удалить старые стили, написать новые)
- `src/main.js` — переписать (убрать Three.js)
- `src/core/orchestrator.js` — упростить
- `src/themes/` — themeManager.js уже есть, использовать для переключения

## Constraints

- Только Business mode — Desktop OS не трогаем
- Никаких новых зависимостей
- FPS не актуален (нет 3D) — но анимации должны быть плавными
- Контент весь из PONYTAIL.LOCALE — ни одного хардкода
