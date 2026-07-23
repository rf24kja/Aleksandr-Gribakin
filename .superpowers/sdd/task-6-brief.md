### Task 6: Self-Critique Design Review

**Files:**
- Modify: `index.html` (CSS)
- Modify: `src/main.js` (mobile bloom default)

- [ ] **Step 1: Remove scanlines from Dark and Cyber themes**

In `index.html` CSS, add after the `#scanlines` rule:

```css
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

Replace `.section-overlay .section-title` font-size:

```css
.section-overlay .section-title {
  font-size: clamp(9px, 1.2vw, 12px);
}
```

- [ ] **Step 3: Set mobile bloom default to medium**

In `src/main.js`, find the mobile detection block (around the user agent check). Add:

```js
// After existing mobile pixel ratio reduction:
if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('fx:quality', { detail: { level: 'medium' } }))
  }, 1000)
}
```

- [ ] **Step 4: Commit**

```bash
git add index.html src/main.js
git commit -m "polish: design review — scanline cleanup, fluid type, mobile bloom"
```
