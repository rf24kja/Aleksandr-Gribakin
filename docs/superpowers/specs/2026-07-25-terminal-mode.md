# Terminal Mode — Hacker Dashboard

## Concept

Третий режим отображения портфолио: хакерский терминал/дашборд. Чёрный фон, зелёный `#00ff41` акцент, моноширинный шрифт, системные логи, ASCII-интерфейс. Контент тот же (PONYTAIL.LOCALE), но структура и визуал полностью свои.

## Эстетика

- **Фон**: `#0a0a0a` (чёрный с минимальным отливом)
- **Акцент**: `#00ff41` (зелёный матрикс), второй акцент `#ffb000` (жёлтый для WARN)
- **Шрифт**: `'JetBrains Mono', 'Fira Code', monospace`
- **Текст**: `#c0c0c0` (светло-серый), акцентный `#00ff41`
- **Символы**: `│`, `───`, `┌`, `┐`, `└`, `┘`, `▌`, `·`, `$`, `█` (курсор)
- **Размеры**: 13–14px основной, 11px для логов
- **Никаких**: изображений, градиентов, картинок, 3D, скруглений > 4px

## Структура

### Intro — System Boot / Access Log

При загрузке отображается системный лог подключения:

```
┌────────────────────────────────────────────┐
│  █╗ █╗ █████╗  █████╗                     │
│  ██╗██╗██╔══██╗██╔══██╗                   │
│  █╚███╔╝███████║██║  ██║                   │
│  █║╚██╔╝ ██╔══██║██║  ██║                   │
│  █║ ╚═╝  ██║  ██║██████║                   │
│  ╚═╝     ╚═╝  ╚═╝╚═════╝                   │
│                                              │
│  ACCESS GRANTED                              │
│  ──────────────────────────────────          │
│  [  OK  ] Connection from: <visitor-ip>      │
│  [  OK  ] User-Agent: <browser> <os>         │
│  [  OK  ] Session started: <timestamp>       │
│  [ INFO ] Target: Principal Engineer         │
│  ──────────────────────────────────          │
│  visitor@portfolio:~$ _                      │
```

- ASCII-логотип "AG" в рамке
- IP браузера (или "unknown"), User-Agent, таймстемп сессии
- Курсор мигает `█`
- Секция 100% высоты вьюпорта, скролл → следующая

### Stats — Profile Report

```
root@portfolio:~$ cat /etc/profile
─── SYSTEM PROFILE ────────────────────────────
  Years in Production   : 15+
  Projects Shipped      : 40+
  Companies Served      : 7
  Technologies          : 24
  Open Source Stars     : 14
  Fraud Prevented       : $12M+
```

- Команда `cat /etc/profile` + вывод
- Простой список, ключ : значение
- Значения — оранжевым/зелёным

### Career — journalctl

```
root@portfolio:~$ journalctl --since 2007 --until 2026
─── CAREER LOG ──────────────────────────────
  [2023-2026]  PRINCIPAL ENGINEER  @ Tech Corp
  │  Multi-region payment mesh, $4B+ annual
  │  Led 20+ engineers across 3 squads
  │  Reduced infra costs by 42%
  │  → Designed multi-region active-active...
  │  → Reduced infrastructure costs by 42%...

  [2020-2023]  HEAD OF ENGINEERING @ FinScale
  │  Built team 2→18, ML fraud detection
  │  → Built engineering team from 2 to 18...
  │  → Delivered ML fraud detection...
```

- Формат `[период]  ДОЛЖНОСТЬ  @ Компания`
- Описание через `│`
- Первые 3 key achievements: `→ текст`
- Клик → detail panel (существующий)

### Projects — ls -la / targets

```
root@portfolio:~$ ls -la /targets/ --filter=Fintech
─── TARGETS ─────────────────────────────────
  [Fintech]     payment-mesh     ·  $4B+ annual volume
  [ML/AI]       fraud-engine     ·  99.2% precision
  [Infra]       data-lake-arch   ·  500TB/day

root@portfolio:~$ cat payment-mesh/
─── Global Payment Mesh ─────────────────────
  Status:  ACTIVE
  Stack:   Go · Temporal · Kafka · K8s
  Metric:  $4B+ annual · <10ms p99 · 50K TPS
  → click for full intel
```

- Категории: `[Fintech]` / `[ML/AI]` и т.д.
- Фильтр табами (как в business, переиспользовать)
- Карточка = одна строка в таблице
- При клике → detail panel

### Achievements — /etc/achievements

```
root@portfolio:~$ cat /etc/achievements.db
─── MILESTONES ──────────────────────────────
  2026  AI-Powered Code Review     · led team of 15
  2025  OSS Contributor            · core maintainer
  2024  2× FAANG adoption          · K8s CLI shipped
```

- Год | заголовок | описание
- Одна строка на достижение
- Клик → detail panel (существующий)

### Contact — transmit

```
root@portfolio:~$ ./transmit --to="RF24KRSK@gmail.com"
─── TRANSMIT ─────────────────────────────────
  ┌──────────────────────────────────────┐
  │  From    : _________________________ │
  │  Subject : _________________________ │
  │  Message : _________________________ │
  │                                      │
  │  [ SEND TRANSMISSION ]               │
  └──────────────────────────────────────┘
```

- Поля с label и placeholder
- Кнопка `[ SEND TRANSMISSION ]`
- Успех: `TRANSMISSION SENT (200 OK)`
- Ошибка: `ERROR: TRANSMISSION FAILED (code)`

## Технические детали

### CSS
- Весь блок под `[data-mode="terminal"]` — не пересекается с business/desktop
- Переменные: `--t-bg`, `--t-text`, `--t-accent`, `--t-warn`, `--t-border`, `--t-font`
- Сканлайн (опционально): `repeating-linear-gradient` с полупрозрачными полосами
- Курсор: `@keyframes blink` для `█`

### Режим
- Добавить `terminal` в цикл переключения модов (сейчас только business/desktop)
- Разрешить `terminal` в desktop.js (сейчас фильтруется)
- Theme toggle (dark/light) для terminal — неактуален, всегда тёмный

### Контент
- Переиспользовать `orchestrator.js` — `_renderStats()`, `_renderCareer()`, `_renderProjects()`, `_renderAchievements()`
- Intro — новый HTML-блок (или модификация существующего `#introText`)
- Добавить `visitor@portfolio:~$ _` с курсором
- Форма — существующая, только CSS-стилизация

## Файлы

| Файл | Изменения |
|------|-----------|
| `index.html` | Добавить CSS блок `[data-mode="terminal"]` ~200 строк. Модифицировать Intro HTML |
| `src/main.js` | Добавить `terminal` в цикл переключения модов |
| `src/themes/desktop/desktop.js` | Разрешить terminal в списке модов |
| `src/core/orchestrator.js` | Не менять (контент переиспользуется) |

## Constraints

- Никаких новых зависимостей
- Контент из PONYTAIL.LOCALE — ни одного хардкода
- Intro использует реальные данные браузера (navigator.userAgent и т.д.)
- Detail panel переиспользует существующую (`projectDetail.js`)
- Все скриншоты (SVG) в detail panel — terminal-стиль
