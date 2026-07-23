### Task 5: Micro-animations

**Files:**
- Modify: `index.html` (CSS) 
- Modify: `src/core/orchestrator.js` (detail panel skeleton + CTA spinner)

- [ ] **Step 1: Career hover — scale + border-left expand**

In `index.html` CSS, replace existing `.career-item` transition and `:hover`:

```css
.career-item {
  display: flex; gap: 8px; margin-bottom: 1px; border-radius: var(--radius);
  background: var(--section-bg); opacity: 0; transform: translateX(-15px);
  transition: all .3s cubic-bezier(.4,0,.2,1); cursor: pointer; overflow: hidden;
}
.career-item.visible { opacity: 1; transform: translateX(0); }
.career-item:hover {
  border-left: 2px solid var(--accent);
  padding-left: 0;
  transform: scale(1.01);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}
.career-item .period { font-family: var(--font-mono); font-size: 11px; color: var(--accent); padding: 12px 16px 0; letter-spacing: .04em; min-width: 120px; flex-shrink: 0; padding-left: 14px; }
```

- [ ] **Step 2: Achievement hover — glow + translateY**

Replace existing `.achievement-item` hover:

```css
.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--glow-strong), 0 0 40px var(--glow);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--section-bg) 70%, transparent);
}
```

- [ ] **Step 3: Add skeleton shimmer CSS for detail panel**

Add new CSS before `#projectDetail` rule:

```css
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

- [ ] **Step 4: Add skeleton to detail panel open**

In `src/core/orchestrator.js`, find where the detail panel is populated (search for `_showProjectDetail` or check where `renderProjectPage` is called). Add skeleton HTML before content loads. The pattern is:

Find the function that opens the detail panel (likely the one that sets `#projectDetail` innerHTML). At the start of that code path:

```js
const panel = document.getElementById('projectDetail')
if (panel) {
  panel.innerHTML = '<div class="pd-panel" style="padding:32px"><div class="pd-skeleton"></div><div class="pd-skeleton"></div><div class="pd-skeleton"></div></div>'
  panel.classList.add('active')
}
```

The skeleton should appear before `renderProjectPage`/`renderCareerPage`/`renderAchievementPage` replaces it.

- [ ] **Step 5: Theme switcher pulse animation**

Add to existing `.theme-btn.active`:

```css
.theme-btn.active {
  animation: theme-activate .4s ease;
}
@keyframes theme-activate {
  0% { box-shadow: 0 0 0 var(--glow); }
  50% { box-shadow: 0 0 24px var(--glow-strong), 0 0 48px var(--glow); }
  100% { box-shadow: 0 0 12px var(--glow); }
}
```

- [ ] **Step 6: CTA button loading spinner CSS**

Add after the existing `button[type="submit"]:disabled` rule:

```css
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

- [ ] **Step 7: Wire .loading class to submit button**

In `src/core/orchestrator.js`, find the form submit handler (around line 448). Add `.loading` class toggle:

Before `animateSubmission(btn);` add:
```js
btn.classList.add('loading')
```

In the catch block after the API fetch (line 462), remove `.loading`:
```js
btn.classList.remove('loading')
```

In `_showFormSuccess`, also remove `.loading`:
```js
form.querySelector('[type="submit"]')?.classList.remove('loading')
```

- [ ] **Step 8: Standardise overlay transition easing**

Replace the `.section-overlay` transition properties:

```css
.section-overlay {
  transition: opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1);
}
```

- [ ] **Step 9: Commit**

```bash
git add index.html src/core/orchestrator.js
git commit -m "feat: micro-animations — hover effects, skeleton, spinner, standard easing"
```
