### Task 3: Accessibility — Skip-to-Content, Focus Indicators, Reduced Motion, ARIA

**Files:**
- Modify: `index.html` (CSS + HTML)
- Modify: `src/main.js` (reduced motion for Three.js)
- Modify: `src/config/ponytail.config.js` (SKIP_LINK locale key)

- [ ] **Step 1: Add SKIP_LINK locale keys**

In `ponytail.config.js`, add to EN:
```js
SKIP_LINK: 'Skip to content',
```
Add to RU:
```js
SKIP_LINK: 'Перейти к содержанию',
```

- [ ] **Step 2: Add skip-to-content link HTML as first child of `<body>`**

```html
<a href="#mainContent" class="skip-link" data-i18n="SKIP_LINK">Skip to content</a>
```

Then wrap all overlays in `<div id="mainContent">` — specifically the elements from `#portrait-wrap` through the CTA section `</section>`. The structure should be:

```html
<body>
  <a href="#mainContent" class="skip-link" data-i18n="SKIP_LINK">Skip to content</a>
  <!-- Preloader, scroll progress, canvas, scanlines remain outside -->
  <div id="mainContent">
    <!-- existing portrait-wrap, overlays, form-section, etc -->
  </div>
  <!-- coffee-popup, projectDetail, page404 remain outside -->
```

- [ ] **Step 3: Add skip-link CSS in `<style>` block (after `::selection` rule)**

```css
.skip-link {
  position: fixed; top: -100%; left: 16px; z-index: 10000;
  padding: 8px 18px; background: var(--accent); color: var(--bg);
  font-family: var(--font-mono); font-size: 12px;
  border-radius: 0 0 6px 6px; text-decoration: none;
  transition: top .2s;
}
.skip-link:focus { top: 0; outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 4: Add `:focus-visible` styles**

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
button:focus:not(:focus-visible),
a:focus:not(:focus-visible),
input:focus:not(:focus-visible),
textarea:focus:not(:focus-visible) { outline: none; }
```

- [ ] **Step 5: Add `prefers-reduced-motion` media query at end of `<style>` block**

```css
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

- [ ] **Step 6: Add reduced-motion check in main.js**

Find the section after renderer setup (around line 65). Add:

```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.setAttribute('data-reduced-motion', '')
  document.dispatchEvent(new CustomEvent('fx:quality', { detail: { level: 'low' } }))
}
```

- [ ] **Step 7: Add ARIA attributes**

- Add `aria-live="polite"` and `aria-label="Statistics"` to `#statsGrid`
- Add `aria-live="polite"` and `role="status"` to `#scene-label`
- Add `aria-label="Submit contact form"` to form submit button

- [ ] **Step 8: Add `aria-current="true"` to active theme button**

In `src/main.js`, find the theme button click handler (around line 217-249). After setting `data-theme`, add:

```js
document.querySelectorAll('.theme-btn').forEach(b => b.removeAttribute('aria-current'))
document.querySelector(`.theme-btn[data-theme="${theme}"]`)?.setAttribute('aria-current', 'true')
```

- [ ] **Step 9: Commit**

```bash
git add index.html src/main.js src/config/ponytail.config.js
git commit -m "feat: accessibility — skip-to-content, focus-visible, reduced motion, ARIA"
```
