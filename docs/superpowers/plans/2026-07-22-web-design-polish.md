# Web Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5-phase polish of portfolio site: microcopy, accessibility, mobile-first, micro-animations, self-critique.

**Architecture:** All CSS lives in `index.html` `<style>` block (6800+ lines). All text via `PONYTAIL.LOCALE` in `src/config/ponytail.config.js`. Three.js scenes, scroll orchestration, and form logic in `src/core/orchestrator.js` + `src/main.js`.

**Tech Stack:** Vite, Three.js, GSAP, CSS custom properties, ES modules.

## Global Constraints

- No new npm dependencies
- All CSS in `index.html` `<style>` — no new files
- All display text via `PONYTAIL.LOCALE` keys — never hardcoded
- FPS ≥ 45 on target hardware after every change
- Follow existing code patterns (Ponytail conventions)

---

### Task 1: Add Microcopy Locale Keys

**Files:**
- Modify: `src/config/ponytail.config.js:1-202`

- [ ] **Step 1: Add EN locale keys for validation errors, 404, empty states**

```js
// Add to EN object (around line 77, before COFFEE:)
FORM_ERRORS: {
  NAME_REQUIRED: 'Enter your name',
  EMAIL_REQUIRED: 'Enter your email',
  EMAIL_INVALID: 'That does not look like an email',
  MSG_REQUIRED: 'Describe your project briefly',
  NETWORK: 'Network error. Try again later.',
  RATE_LIMIT: 'Slow down. One message at a time.',
},
_PAGE_404: {
  TITLE: '404 — Page Not Found',
  SUB: 'This route does not exist.',
  CTA: 'Return Home',
},
```

```js
// Add to RU object (around line 148, before COFFEE:)
FORM_ERRORS: {
  NAME_REQUIRED: 'Введите ваше имя',
  EMAIL_REQUIRED: 'Введите ваш email',
  EMAIL_INVALID: 'Это не похоже на email',
  MSG_REQUIRED: 'Опишите ваш проект кратко',
  NETWORK: 'Ошибка сети. Попробуйте позже.',
  RATE_LIMIT: 'Не так быстро. По одному сообщению.',
},
_PAGE_404: {
  TITLE: '404 — Страница не найдена',
  SUB: 'Этот маршрут не существует.',
  CTA: 'Вернуться на главную',
},
```

- [ ] **Step 2: Add form placeholder polish — more personality-driven variants**

```js
// Replace existing FORM.PLACEHOLDER_NAME in EN (line 77):
PLACEHOLDER_NAME: 'Your name, or your best alias',

// Replace existing FORM.PLACEHOLDER_EMAIL in EN (line 77):
PLACEHOLDER_EMAIL: 'where pixels meet purpose',

// Replace existing FORM.PLACEHOLDER_MSG in EN (line 77):
PLACEHOLDER_MSG: 'Product, team, dream — paint the picture...',

// Replace existing FORM.PLACEHOLDER_NAME in RU (line 150):
PLACEHOLDER_NAME: 'Имя или лучший псевдоним',

// Replace existing FORM.PLACEHOLDER_EMAIL in RU (line 150):
PLACEHOLDER_EMAIL: 'туда, где живёт идея',

// Replace existing FORM.PLACEHOLDER_MSG in RU (line 150):
PLACEHOLDER_MSG: 'Продукт, команда, мечта — опишите картину...',
```

- [ ] **Step 3: Commit**

```bash
git add src/config/ponytail.config.js
git commit -m "feat: add microcopy locale keys for validation, 404, form placeholders"
```

---

### Task 2: Wire Microcopy into Form Validation

**Files:**
- Read: `src/core/orchestrator.js` (form validation section)
- Modify: `src/core/orchestrator.js` (validation error rendering)

- [ ] **Step 1: Read the orchestrator file**

```bash
cat -n src/core/orchestrator.js | head -450
```

- [ ] **Step 2: Update `_renderFormErrors` to use locale keys**

The function currently receives error object like `{ name: 'Required', email: 'Invalid' }`. Change it to look up keys from `PONYTAIL.LOCALE[lang].FORM_ERRORS`:

```js
// In _renderFormErrors(errors, lang) — replace body with:
const t = PONYTAIL.LOCALE[lang].FORM_ERRORS
Object.keys(errors).forEach(field => {
  const el = document.querySelector(`[data-field-error="${field}"]`)
  if (!el) return
  const key = errors[field] // 'required' | 'invalid' | 'network' | 'ratelimit'
  el.textContent = t[key.toUpperCase() + '_' + field.toUpperCase?.()] || t[key.toUpperCase()] || errors[field]
  el.style.opacity = '1'
})
```

- [ ] **Step 3: Add 404 section HTML to index.html**

```html
<!-- Add after #projectDetail div, before </body> -->
<div id="page404" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9997;background:var(--bg);flex-direction:column;align-items:center;justify-content:center;font-family:var(--font-mono);text-align:center;gap:12px;">
  <div style="font-size:48px;color:var(--accent);font-weight:200;">404</div>
  <div data-i18n="_PAGE_404.TITLE" style="font-size:14px;color:var(--text-bright);"></div>
  <div data-i18n="_PAGE_404.SUB" style="font-size:11px;color:var(--text-dim);"></div>
  <button data-i18n="_PAGE_404.CTA" style="margin-top:8px;padding:8px 20px;background:transparent;border:1px solid var(--accent);color:var(--accent);font-family:var(--font-mono);cursor:pointer;" onclick="window.location.hash=''">Return Home</button>
</div>
```

- [ ] **Step 4: Wire 404 display in hash router**

In `src/core/orchestrator.js`, find `_wireHashRouter()`. Add a case for unknown hashes that shows `#page404`:

```js
// In _wireHashRouter, after the existing pattern checks, add:
if (!handled && hash) {
  document.getElementById('page404').style.display = 'flex'
  document.getElementById('page404').style.cssText += ';display:flex'
  this._applyI18n()
}
```

- [ ] **Step 5: Commit**

```bash
git add index.html src/core/orchestrator.js
git commit -m "feat: wire form validation errors to locale, add 404 page"
```

---

### Task 3: Accessibility — Skip-to-Content, Focus Indicators, Reduced Motion

**Files:**
- Modify: `index.html` (CSS + HTML)
- Modify: `src/main.js` (reduced motion for Three.js)

- [ ] **Step 1: Add skip-to-content link HTML**

```html
<!-- Add as first child of <body> -->
<a href="#mainContent" class="skip-link" data-i18n="SKIP_LINK">Skip to content</a>
```

Add corresponding locale keys in ponytail.config.js:

```js
// Add to EN:
SKIP_LINK: 'Skip to content',

// Add to RU:
SKIP_LINK: 'Перейти к содержанию',
```

Wrap all content overlays in a `#mainContent` div:

```html
<div id="mainContent">
  <!-- existing .intro-text, .section-overlay, .form-section, etc -->
</div>
```

- [ ] **Step 2: Add skip-link CSS**

```css
/* Add to <style> block after the ::selection rule */
.skip-link {
  position: fixed; top: -100%; left: 16px; z-index: 10000;
  padding: 8px 18px; background: var(--accent); color: var(--bg);
  font-family: var(--font-mono); font-size: 12px;
  border-radius: 0 0 6px 6px; text-decoration: none;
  transition: top .2s;
}
.skip-link:focus { top: 0; outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 3: Add focus-visible styles**

```css
/* Add below skip-link CSS */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
button:focus:not(:focus-visible),
a:focus:not(:focus-visible),
input:focus:not(:focus-visible),
textarea:focus:not(:focus-visible) { outline: none; }
```

- [ ] **Step 4: Add prefers-reduced-motion media query**

```css
/* Add at end of <style> block */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  #scanlines { display: none !important; }
  #preloader .pl-logo.glitch,
  #preloader .pl-logo.glitch::before,
  #preloader .pl-logo.glitch::after {
    animation: none !important;
  }
  .section-overlay { transform: none !important; }
  .career-item { transform: none !important; }
  .project-card { transform: none !important; }
  .achievement-item { transform: none !important; }
  .coffee-egg { animation: none !important; }
  .intro-text { transition: opacity .5s; }
}
```

- [ ] **Step 5: Add reduced-motion check in main.js**

```js
// Add after renderer setup in main.js (around line 65):
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReducedMotion) {
  document.documentElement.setAttribute('data-reduced-motion', '')
  // Disable animation-heavy Three.js by setting bloom to minimum
  document.dispatchEvent(new CustomEvent('fx:quality', { detail: { level: 'low' } }))
}
```

- [ ] **Step 6: Add ARIA attributes**

```html
<!-- In the CTA form section, add to existing elements: -->
<button type="submit" ... aria-label="Submit contact form">...</button>
```

```html
<!-- Add to stats grid area — aria-live region -->
<div class="stats-grid" id="statsGrid" aria-live="polite" aria-label="Statistics"></div>
```

```html
<!-- Add to scene label for current section context -->
<div id="scene-label" aria-live="polite" role="status"></div>
```

- [ ] **Step 7: Add aria-current to theme switcher and language buttons**

In `src/main.js`, update theme button click handler and language toggle handler to set `aria-current="true"` on active button.

- [ ] **Step 8: Commit**

```bash
git add index.html src/main.js src/config/ponytail.config.js
git commit -m "feat: add accessibility — skip-to-content, focus-visible, reduced motion, ARIA"
```

---

### Task 4: Mobile-First Improvements

**Files:**
- Modify: `index.html` (CSS + portrait img)

- [ ] **Step 1: Enable touch feedback on project cards mobile**

Replace the existing `@media (max-width: 768px)` style block's `.project-card .card-inner { pointer-events: none; }`:

```css
@media (max-width: 768px) {
  /* ... existing rules ... */
  .project-card { -webkit-tap-highlight-color: rgba(201,168,108,.15); }
  .project-card .card-inner { pointer-events: auto; }
  .project-card:active .card-inner { background: color-mix(in srgb, var(--accent) 8%, transparent); }
  /* ... keep rest ... */
}
```

- [ ] **Step 2: Add srcSet for portrait image**

Replace existing `#portrait` img tag:

```html
<img id="portrait"
  src="/img_2025_12_23.png"
  srcset="/img_2025_12_23.png 1x, /img_2025_12_23@2x.png 2x"
  alt="Aleksandr Gribakin"
  fetchpriority="high"
  decoding="async" />
```

- [ ] **Step 3: Ensure tap targets ≥ 44px**

Check and adjust theme button size in media query:

```css
@media (max-width: 768px) {
  .theme-btn { width: 40px; height: 40px; }
  .lang-toggle { padding: 10px 16px; font-size: 12px; }
  .coffee-egg { width: 44px; height: 44px; }
}
```

- [ ] **Step 4: Add mobile 3D fallback in main.js**

```js
// Add after quality detection section in main.js (around line 140):
if (window.innerWidth < 768) {
  setTimeout(() => {
    const fps = Number(document.getElementById('fpsCounter')?.textContent?.split(' ')[0])
    if (fps < 30) {
      renderer.setAnimationLoop(null) // pause render
      document.querySelector('canvas#webgl').style.display = 'none'
    }
  }, 5000)
}
```

- [ ] **Step 5: Commit**

```bash
git add index.html src/main.js
git commit -m "feat: mobile-first — touch feedback, srcSet, tap targets, 3D fallback"
```

---

### Task 5: Micro-animations

**Files:**
- Modify: `index.html` (CSS animations)

- [ ] **Step 1: Career hover — scale + border-left expand**

```css
/* Replace existing .career-item transition and :hover */
.career-item {
  transition: all .3s cubic-bezier(.4,0,.2,1);
}
.career-item:hover {
  transform: scale(1.01);
  border-left: 2px solid var(--accent);
  padding-left: 0;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}
/* Adjust period padding for border-left */
.career-item .period { padding-left: 14px; }
```

- [ ] **Step 2: Achievement hover — glow + translateY**

```css
/* Replace existing .achievement-item :hover */
.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--glow-strong), 0 0 40px var(--glow);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--section-bg) 70%, transparent);
}
```

- [ ] **Step 3: Add CSS skeleton shimmer for detail panel loading**

```css
/* Add before #projectDetail */
@keyframes skeleton-pulse {
  0%,100% { opacity: .4; }
  50% { opacity: .7; }
}
.pd-skeleton {
  display: block; height: 16px; margin-bottom: 10px;
  background: color-mix(in srgb, var(--text-bright) 5%, transparent);
  border-radius: 4px; animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.pd-skeleton:first-child { width: 70%; height: 24px; }
.pd-skeleton:nth-child(2) { width: 90%; }
.pd-skeleton:nth-child(3) { width: 60%; height: 120px; border-radius: 8px; }
```

- [ ] **Step 4: Add loading state to detail panel open**

In `src/core/orchestrator.js`, find the function that opens project detail (likely `_showProjectDetail` or similar). Add skeleton HTML before loading content:

```js
// At the start of the detail render function, before content:
const panel = document.getElementById('projectDetail')
panel.innerHTML = '<div class="pd-panel" style="padding:32px"><div class="pd-skeleton"></div><div class="pd-skeleton"></div><div class="pd-skeleton"></div></div>'
panel.classList.add('active')
// Then fetch/render actual content and replace
```

- [ ] **Step 5: Theme switcher pulse on active change**

```css
/* Add to existing .theme-btn.active */
.theme-btn.active {
  animation: theme-activate .4s ease;
}
@keyframes theme-activate {
  0% { box-shadow: 0 0 0 var(--glow); }
  50% { box-shadow: 0 0 24px var(--glow-strong), 0 0 48px var(--glow); }
  100% { box-shadow: 0 0 12px var(--glow); }
}
```

- [ ] **Step 6: CTA button loading spinner**

```css
/* Add after existing .terminal-form button rules */
.terminal-form button[type="submit"].loading {
  position: relative; color: transparent; pointer-events: none;
}
.terminal-form button[type="submit"].loading::after {
  content: ''; position: absolute; top: 50%; left: 50%;
  width: 18px; height: 18px; margin: -9px 0 0 -9px;
  border: 2px solid var(--accent); border-top-color: transparent;
  border-radius: 50%; animation: btn-spin .6s linear infinite;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }
```

Add logic in `src/core/orchestrator.js` form handler to toggle `.loading` class on submit button.

- [ ] **Step 7: Standardise overlay transitions**

Update existing `.section-overlay` transition:

```css
.section-overlay {
  transition: opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1);
}
```

- [ ] **Step 8: Commit**

```bash
git add index.html src/core/orchestrator.js
git commit -m "feat: micro-animations — career/achievement hover, skeleton, spinner, standard easing"
```

---

### Task 6: Self-Critique Design Review

- [ ] **Step 1: Remove scanlines from Cyber and Dark themes**

```css
/* Add after the #scanlines rule: */
[data-theme="dark"] #scanlines,
[data-theme="cyber"] #scanlines {
  background: transparent !important;
}
[data-theme="dark"] #scanlines::after,
[data-theme="cyber"] #scanlines::after {
  display: none !important;
}
```

- [ ] **Step 2: Add fluid type to section headers**

Replace `.section-title` font-size:

```css
.section-overlay .section-title {
  font-size: clamp(9px, 1.2vw, 12px);
}
```

- [ ] **Step 3: Standardise all transitions to same easing**

Find and replace all `cubic-bezier(.23,1,.32,1)` occurrences with `cubic-bezier(.4,0,.2,1)` for consistency. Use search to verify.

- [ ] **Step 4: Set mobile bloom default to medium**

In `src/main.js`, find the mobile detection block. Add:

```js
// After mobile pixel ratio reduction:
if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
  document.dispatchEvent(new CustomEvent('fx:quality', { detail: { level: 'medium' } }))
}
```

- [ ] **Step 5: Commit**

```bash
git add index.html src/main.js
git commit -m "polish: design review — scanline cleanup, fluid type, consistent easing, mobile bloom"
```

---

### Verification

- [ ] **Step 1: Run build and verify no errors**

```bash
npx vite build 2>&1
```

- [ ] **Step 2: Start dev server and visually verify**

```bash
npx vite --host 2>&1
```

- [ ] **Step 3: Manual checklist**
  - Verify 404 page shows on unknown hash
  - Verify form shows locale error messages
  - Tab through page — skip-link appears on first Tab
  - Tab through interactive elements — focus-visible ring visible
  - Resize to mobile — touch feedback on project cards
  - Enable reduced motion in OS settings — animations stop
  - Career/achievement hover — smooth animation
  - Submit form — loading spinner appears
  - Switch themes — no scanlines on Dark/Cyber
  - FPS stays green on desktop + mobile
