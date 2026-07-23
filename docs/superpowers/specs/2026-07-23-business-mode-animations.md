# Business Mode — Animations & Interaction Polish

## Concept

Добавить бизнес-режиму визуальной отточенности: hover-эффекты, безопасные entrance-микроанимации, анимация счётчиков и плавный scroll. Все анимации — CSS, без JS-зависимостей для базовой видимости контента.

## Принципы

1. **Контент всегда видим** — ни одна анимация не использует `opacity: 0` как начальное состояние. Элементы отображаются сразу.
2. **Graceful degradation** — если анимация не сработала (JS отключён, CSS не загрузился, IntersectionObserver не сработал), контент остаётся полностью доступен.
3. **Одноразовость** — entrance-анимации и счётчики срабатывают один раз при первом появлении в viewport.
4. **Только Business mode** — Desktop OS и Terminal темы не изменяются.

---

## 1. Hover Effects

Все эффекты — CSS transition `0.2s ease`.

### Career
```css
[data-mode="business"] .career-item:hover {
  border-color: rgba(233,84,32,.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
}
```

### Project Cards
```css
[data-mode="business"] .project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,.12);
  border-color: rgba(233,84,32,.25);
}
```

### Achievement Cards
```css
[data-mode="business"] .achievement-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
  border-color: rgba(233,84,32,.2);
}
```

### Stats (stat-value accent on hover)
```css
[data-mode="business"] .stat-item:hover .stat-value {
  color: var(--b-accent);
}
```

### Category Tab active indicator
```css
[data-mode="business"] .cat-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--b-accent);
}
.cat-tab { position: relative; }
```

**Файл**: `index.html` — CSS блок `[data-mode="business"]`

---

## 2. Entrance Micro-animations

### CSS
```css
@keyframes biz-entrance {
  0%   { transform: translateY(6px) scale(0.99); opacity: .7; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
[data-mode="business"] .entered {
  animation: biz-entrance 0.35s ease-out forwards;
}
```

**Важно**: начальное состояние элементов — `opacity: 1; transform: none`. Класс `.entered` только запускает короткую анимацию. Без класса — элемент уже видим.

### JS (orchestrator.js)

Добавить метод `_observeEntrance()`, вызываемый после `_renderContent()`:

```js
_observeEntrance() {
  if (this._entranceObserved) return;
  this._entranceObserved = true;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('entered');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.stat-item, .career-item, .project-card, .achievement-item')
    .forEach(el => obs.observe(el));
}
```

- Вызывается в `_renderContent()` и `_reRenderContent()`
- Observer unobserves элемент после первого срабатывания
- Если IntersectionObserver не поддерживается — элементы остаются видимыми без анимации

### Применяется к:
- `.stat-item`
- `.career-item`
- `.project-card`
- `.achievement-item`

---

## 3. Stats Counter Animation

### Механизм

Число рендерится сразу как `data-target`. Анимация — временный счёт от 0 до target при активации:

```js
_renderStats() {
    ...
    grid.innerHTML = stats.map((s) =>
      `<div class="stat-item"><div class="stat-value" data-target="${s.value}">${s.value}</div><div class="stat-label">${s.label}</div></div>`
    ).join('');
}
```

Метод `_animateStats()` вызывается один раз при пересечении stats секции с viewport:

```js
_animateStats() {
  if (this._statsCounted) return;
  this._statsCounted = true;
  document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    el.textContent = '0'; // start from 0
    const dur = 800, start = performance.now();
    const frame = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
```

- Если анимация не сработала (observer не сработал, RAF не запустился) — число уже равно `data-target`, пользователь видит корректное значение
- Единственный визуальный эффект при работающей анимации: число сбрасывается на 0 и считает до target за 800ms

---

## 4. Smooth Scroll Navigation

### Механизм

Хэш-роутер уже есть в `_initHashRouter()` orchestrator.js. Заменить переход на плавный скролл при клике по внутренней ссылке (`data-scroll-to`):

```js
document.querySelectorAll('[data-scroll-to]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('data-scroll-to');
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${targetId}`);
    }
  });
});
```

- Только для Business mode (проверить `IS_BUSINESS`)
- Существующий хэш-роутер остаётся для прямой навигации по URL

---

## 5. File Changes

| File | Changes |
|------|---------|
| `index.html` | Добавить CSS: hover-эффекты (4 блока), `@keyframes biz-entrance`, класс `.entered`, индикатор активного таба |
| `src/core/orchestrator.js` | Добавить `_observeEntrance()`, `_animateStats()`, smooth scroll handler. Вызовы в `_renderContent()`/`_reRenderContent()`. |

---

## Constraints

- Никаких новых зависимостей
- Все анимации через CSS (кроме счётчиков — RAF)
- Контент виден при любом сценарии отказа
- Только Business mode
