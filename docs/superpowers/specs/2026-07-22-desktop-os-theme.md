# Desktop OS Theme — Portfolio as Desktop Environment

## Concept

Портфолио выглядит как Linux Desktop (Ubuntu-style) с иконками, окнами и панелью задач. Вместо скролл-сайта — полноценная среда, где каждый раздел портфолио открывается как отдельное приложение/окно.

## Эстетика (Ubuntu Desktop)

- Нижняя панель (taskbar): кнопка "Activities", список открытых окон, системный трей (часы, переключение режимов)
- **Цвета**: тёмный фон `#2d2d2d`, titlebar `#3c3b37`, акцент оранжевый `#e95420` (Ubuntu orange), фиолетовый `#5e2750` для старого Ubuntu
- **Иконки**: 48×48, Ubuntu-style (символические, монохромные)
- **Шрифт**: Ubuntu Font Family (через Google Fonts) или fallback `'Ubuntu', 'Noto Sans', system-ui, sans-serif`
- Окна с закруглёнными углами (`border-radius: 8px`), тень, drag, resize
- Рабочий стол: градиент тёмно-фиолетовый → тёмно-серый (как Ubuntu 20.04+)
- **Titlebar кнопки**: стандартные Ubuntu (свернуть/развернуть/закрыть слева, а-ля macOS-style)
- Клик левой кнопкой → открыть, правой → контекстное меню (не обязательно в MVP)
- Минималистично, современно, узнаваемый Ubuntu-стиль

## Приложения

| Ярлык | Тип | Функция |
|-------|-----|---------|
| About Me | Визитка | Имя, роль, стек, контакты, ссылки |
| File Manager | Браузер проектов | Категории слева, файлы проектов справа, клик → README |
| Career | Папка | Список карьерных записей |
| Achievements | Приложение | Достижения как список |
| Aura-Omnimesh | Папка | Current project: coming soon |
| Mail | Форма связи | Форма отправки сообщения |
| Settings | Настройки | Смена темы (OS ↔ Terminal ↔ Business), язык |
| Terminal | Терминал | Эмулятор (заглушка — будет в Terminal теме) |

## Окна

- Drag by titlebar
- Resize by bottom-right corner
- Minimize → сворачивается в панель задач
- Maximize → на весь экран
- Close → крестик
- Z-index: последнее активное окно сверху
- Несколько окон открыто одновременно

## Технически

- Единый `index.html`, режим переключается через `data-mode="desktop"` | `"business"` | `"terminal"`
- Весь контент из `PONYTAIL.LOCALE` — никаких дубликатов
- Desktop mode: 3D-сцены выключены (canvas#webgl display:none)
- Desktop OS theme = чистый JS/CSS, никаких новых зависимостей
- Window manager: класс `WindowManager` (~150 строк)
- Иконки: Unicode-символы + CSS (минимум внешних файлов)
- Состояние в localStorage (режим, позиции окон)

## Content Notes

- Aura-Omnimesh: "Coming soon" + название протокола
- Все данные переиспользуются из существующих LOCALE ключей
- 3 режима: `desktop` (Ubuntu-стиль), `business` (редизайн), `terminal`

## Структура файлов

```
index.html          — основная разметка (десктоп HTML)
src/
  themes/
    desktop/
      desktop.js     — инициализация десктопа, иконки
      window.js      — WindowManager: создание окон, drag, resize
      icons.js       — CSS-иконки
      apps.js        — каждое приложение (about, explorer, mail, etc)
      style.css      — вся стилизация десктопа (в index.html style)
  config/
    ponytail.config.js — существующий (не меняется)
    themes.js          — конфиг 3 тем: цвет, отключение 3D, шрифты
  core/
    orchestrator.js  — минимальные изменения (поддержка 3 режимов)
    windowManager.js — вынесенный менеджер окон
```

Ponytail: всё в нескольких файлах, без фреймворков. Window manager — класс, ~150 строк.
