### Task 4: Mobile-First Improvements

**Files:**
- Modify: `index.html` (CSS + portrait img)
- Modify: `src/main.js` (3D fallback)

- [ ] **Step 1: Enable touch feedback on project cards mobile**

Find the `@media (max-width: 768px)` block. Replace `.project-card .card-inner { pointer-events: none; }` with:

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

Replace the existing `<img id="portrait">` tag:

```html
<img id="portrait"
  src="/img_2025_12_23.png"
  srcset="/img_2025_12_23.png 1x, /img_2025_12_23@2x.png 2x"
  alt="Aleksandr Gribakin"
  fetchpriority="high"
  decoding="async" />
```

- [ ] **Step 3: Ensure tap targets ≥ 44px on mobile**

In the `@media (max-width: 768px)` block, add/update:

```css
.theme-btn { width: 40px; height: 40px; }
.lang-toggle { padding: 10px 16px; font-size: 12px; }
.coffee-egg { width: 44px; height: 44px; }
```

- [ ] **Step 4: Add mobile 3D fallback in main.js**

Find the quality detection section (near the `fx:quality` event listener). Add after it:

```js
if (window.innerWidth < 768) {
  setTimeout(() => {
    const fpsText = document.getElementById('fpsCounter')?.textContent || ''
    const fps = Number(fpsText.split(' ')[0])
    if (fps > 0 && fps < 30) {
      renderer.setAnimationLoop(null)
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
