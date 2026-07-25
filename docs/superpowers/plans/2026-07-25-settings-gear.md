# Settings Gear Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace scattered theme/mode buttons with a single spinning gear → settings popup. Remove legacy 4-theme system.

**Architecture:** Add gear HTML/CSS/JS alongside existing controls first (no breakage), then remove old buttons/CSS/handlers.

**Tech Stack:** Vanilla CSS + JS, no dependencies.

## Global Constraints
- Keep `[data-mode="business"]` + `[data-theme="dark"|"light"]` fully intact
- Keep `[data-mode="desktop"]` and `[data-mode="terminal"]` fully intact
- Keep `setMode()`, `applyTheme()`, `initMode()` untouched in themeManager.js
- New i18n keys: `SETTINGS`, `SETTINGS_THEME`, `SETTINGS_THEME_HINT`, `SETTINGS_INTERFACE`, `SETTINGS_CLOSE`

---
### Task 1: i18n — add 5 keys to ponytail.config.js

**Files:**
- Modify: `src/config/ponytail.config.js`

- [ ] **Step 1: Read ponytail.config.js to find EN and RU locale sections**

```bash
grep -n "EN:" src/config/ponytail.config.js
grep -n "RU:" src/config/ponytail.config.js
```

- [ ] **Step 2: Add EN keys** (insert near end of EN block, before the closing `}`)

```js
SETTINGS: 'Settings',
SETTINGS_THEME: 'Theme',
SETTINGS_THEME_HINT: '(Business mode only)',
SETTINGS_INTERFACE: 'Interface',
SETTINGS_CLOSE: 'Close',
```

- [ ] **Step 3: Add RU keys** (insert same position in RU block)

```js
SETTINGS: 'Настройки',
SETTINGS_THEME: 'Тема',
SETTINGS_THEME_HINT: '(Только для Business)',
SETTINGS_INTERFACE: 'Интерфейс',
SETTINGS_CLOSE: 'Закрыть',
```

- [ ] **Step 4: Verify syntax**

Run: `node -e "import('./src/config/ponytail.config.js').then(m => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add src/config/ponytail.config.js
git commit -m "i18n: add settings gear popup keys (EN/RU)"
```

---
### Task 2: Add gear and popup HTML to index.html

**Files:**
- Modify: `index.html`

**Approach:** Add gear button in 3 mode positions + popup HTML near the `#ui-overlay` area. All wrapped in `display:none` / `display:flex` per mode.

- [ ] **Step 1: Read index.html around line 2520-2530 (ui-overlay area) and line 2541-2558 (mainContent intro)**

- [ ] **Step 2: In `#mainContent .intro-text h1`, add the gear inside `<h1>`**

Replace current h1:
```html
<h1><span class="accent">&lt;</span> ALEKSANDR GRIBAKIN <span class="accent">/&gt;</span></h1>
```
With:
```html
<h1>
  <span class="accent">&lt;</span> ALEKSANDR GRIBAKIN <span class="accent">/&gt;</span>
  <button class="settings-gear" id="settingsGear" title="Settings" aria-label="Open settings">⚙</button>
</h1>
```

- [ ] **Step 3: Add gear to desktop system tray** — in `#system-tray`:

Find line ~2660: `<span id="tray-clock"></span>`
Replace with:
```html
<span id="tray-clock"></span>
<button class="settings-gear" id="settingsGearDesk" title="Settings" aria-label="Open settings">⚙</button>
```

- [ ] **Step 4: Add gear to terminal mode** — inside `#ui-overlay`, replacing the old theme-switcher area:

Find lines ~2520-2531:
```html
<div id="ui-overlay">
  <div class="theme-switcher">...</div>
  <button class="lang-toggle" data-lang-switch></button>
  <button class="mode-toggle" data-mode-switch title="Switch mode">🖥</button>
  <button class="theme-toggle" data-theme-switch title="Toggle theme">☀</button>
  <div class="coffee-egg" id="coffeeEgg" title="☕">☕</div>
</div>
```
Replace with:
```html
<div id="ui-overlay">
  <button class="settings-gear" id="settingsGearUI" title="Settings" aria-label="Open settings">⚙</button>
  <button class="lang-toggle" data-lang-switch></button>
  <div class="coffee-egg" id="coffeeEgg" title="☕">☕</div>
</div>
```

- [ ] **Step 5: Add settings popup HTML** right before `</body>` (after the desktop shell, before the `<script>` tag):

```html
<!-- Settings Popup -->
<div class="settings-popup" id="settingsPopup" style="display:none">
  <div class="settings-backdrop" id="settingsBackdrop"></div>
  <div class="settings-card">
    <div class="settings-header">⚙ <span data-i18n="SETTINGS">Settings</span></div>

    <div class="settings-section">
      <div class="settings-label">◈ <span data-i18n="SETTINGS_THEME">Theme</span></div>
      <div class="settings-theme-group">
        <button class="settings-opt" data-stheme="dark">🌙 <span data-i18n="THEME_DARK">Dark</span></button>
        <button class="settings-opt" data-stheme="light">☀ <span data-i18n="THEME_LIGHT">Light</span></button>
      </div>
      <div class="settings-hint" data-i18n="SETTINGS_THEME_HINT">(Business mode only)</div>
    </div>

    <div class="settings-section">
      <div class="settings-label">◈ <span data-i18n="SETTINGS_INTERFACE">Interface</span></div>
      <div class="settings-mode-group">
        <button class="settings-opt" data-smode="business">💼 <span data-i18n="MODE_BUSINESS">Business</span></button>
        <button class="settings-opt" data-smode="desktop">🖥 <span data-i18n="MODE_DESKTOP">Desktop</span></button>
        <button class="settings-opt" data-smode="terminal">⎔ <span data-i18n="MODE_TERMINAL">Terminal</span></button>
      </div>
    </div>

    <button class="settings-close" id="settingsClose">✕ <span data-i18n="SETTINGS_CLOSE">Close</span></button>
  </div>
</div>
```

- [ ] **Step 6: Add i18n keys for mode/theme labels** — add to ponytail.config.js:

EN:
```js
THEME_DARK: 'Dark',
THEME_LIGHT: 'Light',
MODE_BUSINESS: 'Business',
MODE_DESKTOP: 'Desktop',
MODE_TERMINAL: 'Terminal',
```
RU:
```js
THEME_DARK: 'Тёмная',
THEME_LIGHT: 'Светлая',
MODE_BUSINESS: 'Бизнес',
MODE_DESKTOP: 'Рабочий стол',
MODE_TERMINAL: 'Терминал',
```

- [ ] **Step 7: Commit**

```bash
git add index.html src/config/ponytail.config.js
git commit -m "feat: add settings gear HTML + i18n mode/theme labels"
```

---
### Task 3: Add gear + popup CSS to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Read index.html around line 436 (theme-switcher CSS block) and line 539-540 (gearSpin)**

- [ ] **Step 2: Add settings gear CSS** right after the `.coffee-btn` block (~line 434, before `.theme-switcher`):

```css
/* === Settings Gear === */
.settings-gear {
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: inherit; line-height: 1; color: var(--text-dim);
  animation: gearSpin 4s linear infinite; transition: color .3s;
  display: inline-flex; align-items: center; justify-content: center;
}
.settings-gear:hover { color: var(--text-bright); }
@keyframes gearSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Business mode — gear next to name */
[data-mode="business"] .settings-gear {
  font-size: clamp(18px,2.5vw,30px);
  vertical-align: middle;
  margin-left: 8px;
  color: var(--b-text-dim);
  opacity: .4;
  transition: opacity .3s, color .3s;
}
[data-mode="business"] .settings-gear:hover { opacity: .8; color: var(--b-accent); }

/* Desktop mode — gear in system tray */
[data-mode="desktop"] .settings-gear {
  font-size: 14px;
  padding: 2px 6px;
  color: rgba(255,255,255,.5);
}
[data-mode="desktop"] .settings-gear:hover { color: #fff; }

/* Terminal mode — gear replaces old theme buttons */
[data-mode="terminal"] .settings-gear {
  font-size: 18px;
  padding: 6px;
  color: var(--accent);
  opacity: .6;
}
[data-mode="terminal"] .settings-gear:hover { opacity: 1; }

/* Settings Popup */
.settings-popup {
  position: fixed; inset: 0; z-index: 10000;
  display: flex; align-items: center; justify-content: center;
}
.settings-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px);
}
.settings-card {
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  min-width: 280px;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 24px 80px rgba(0,0,0,.5);
}
.settings-header {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: .1em;
  color: var(--text-bright);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.settings-section {
  margin-bottom: 16px;
}
.settings-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 8px;
}
.settings-theme-group,
.settings-mode-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.settings-opt {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all .2s;
}
.settings-opt:hover {
  border-color: var(--accent);
  color: var(--text);
}
.settings-opt.active {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-color: var(--accent);
  color: var(--accent);
}
.settings-opt:disabled {
  opacity: .3;
  cursor: not-allowed;
  border-color: var(--border);
}
.settings-hint {
  font-size: 9px;
  color: var(--text-dim);
  opacity: .5;
  margin-top: 4px;
  font-style: italic;
}
.settings-close {
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: all .2s;
}
.settings-close:hover {
  border-color: var(--accent);
  color: var(--text);
}
```

- [ ] **Step 3: Add business light theme override for popup** — in the `[data-mode="business"][data-theme="light"]` block add:

```css
[data-mode="business"][data-theme="light"] .settings-card {
  background: #fff;
  border-color: rgba(0,0,0,.12);
}
[data-mode="business"][data-theme="light"] .settings-opt {
  border-color: rgba(0,0,0,.12);
}
[data-mode="business"][data-theme="light"] .settings-opt.active {
  background: rgba(233,84,32,.06);
}
```

- [ ] **Step 4: Add desktop mode popup overrides** — in `[data-mode="desktop"]` block:

```css
[data-mode="desktop"] .settings-card {
  background: #2d2d2d;
  border-color: rgba(255,255,255,.1);
}
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add settings gear + popup CSS, remove cat-tab underline"
```

---
### Task 4: Add JS handler for settings gear + popup

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Read src/main.js lines ~373-398 (click handler section)**

- [ ] **Step 2: Add settings popup logic** — replace the existing click event handler block with updated version:

Find:
```js
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-btn');
  if (btn && btn.dataset.theme !== document.documentElement.getAttribute('data-theme')) {
    applyTheme(btn.dataset.theme);
  }
  const modeBtn = e.target.closest('[data-mode-switch]');
  if (modeBtn) {
    const modes = ['business', 'desktop', 'terminal'];
    const cur = document.documentElement.getAttribute('data-mode') || 'business';
    const next = modes[(modes.indexOf(cur) + 1) % modes.length];
    setMode(next);
    if (next === 'terminal') _populateTerminalIntro();
  }
  const scrollBtn = e.target.closest('[data-scroll-to]');
  if (scrollBtn) {
    const target = document.getElementById(scrollBtn.dataset.scrollTo);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const themeBtn = e.target.closest('[data-theme-switch]');
  if (themeBtn) {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'light' ? 'dark' : 'light';
    applyTheme(next);
  }
});
```

Replace with:
```js
document.addEventListener('click', (e) => {
  // Settings gear click
  if (e.target.closest('.settings-gear')) {
    openSettings();
    return;
  }
  // Settings popup interactions
  if (document.getElementById('settingsPopup').style.display !== 'none') {
    // Theme option
    const themeOpt = e.target.closest('[data-stheme]');
    if (themeOpt) {
      const theme = themeOpt.dataset.stheme;
      const mode = document.documentElement.getAttribute('data-mode') || 'business';
      if (mode === 'business') applyTheme(theme);
      updateSettingsUI();
      return;
    }
    // Mode option
    const modeOpt = e.target.closest('[data-smode]');
    if (modeOpt) {
      const mode = modeOpt.dataset.smode;
      setMode(mode);
      if (mode === 'terminal') _populateTerminalIntro();
      updateSettingsUI();
      return;
    }
    // Close button or backdrop
    if (e.target.closest('#settingsClose') || e.target.closest('#settingsBackdrop')) {
      closeSettings();
      return;
    }
    return; // block other clicks while popup is open
  }
  // Scroll-to (CTA button etc.)
  const scrollBtn = e.target.closest('[data-scroll-to]');
  if (scrollBtn) {
    const target = document.getElementById(scrollBtn.dataset.scrollTo);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
```

- [ ] **Step 3: Add settings popup functions** before the event listener (insert around line ~370):

```js
function openSettings() {
  const popup = document.getElementById('settingsPopup');
  updateSettingsUI();
  popup.style.display = 'flex';
}

function closeSettings() {
  document.getElementById('settingsPopup').style.display = 'none';
}

function updateSettingsUI() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const mode = document.documentElement.getAttribute('data-mode') || 'business';
  // Theme buttons
  document.querySelectorAll('[data-stheme]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.stheme === theme);
    btn.disabled = mode !== 'business';
  });
  // Mode buttons
  document.querySelectorAll('[data-smode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.smode === mode);
  });
}
```

- [ ] **Step 4: Add Escape key listener** — append to the file:

```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const popup = document.getElementById('settingsPopup');
    if (popup.style.display !== 'none') closeSettings();
  }
});
```

- [ ] **Step 5: Commit**

```bash
git add src/main.js
git commit -m "feat: add settings gear popup JS handler"
```

---
### Task 5: Remove old CSS for removed buttons and legacy themes

**Files:**
- Modify: `index.html`

This is the largest task — remove CSS blocks for:
- `.theme-switcher` / `.theme-btn` (lines ~437-453)
- `[data-theme="cyber"]` variable block + theme-specific blocks
- `[data-theme="steampunk"]` blocks
- `[data-theme="terminal"]` (the theme, not the mode) blocks
- `.mode-toggle` / `.theme-toggle` CSS in business mode section
- Old responsive `.theme-switcher` rules (line ~698)
- Per-theme project card blocks for cyber/steampunk/terminal themes

Also: remove `.cat-tab.active::after` underline in business mode.

- [ ] **Step 1: Read index.html CSS sections that need editing** — read lines 52-540 and 545-642

- [ ] **Step 2: Remove `[data-theme="cyber"]` variable block** — lines 71-89:

Remove:
```
[data-theme="cyber"] {
  --bg: #0a0e17;
  --section-bg: #0d1225;
  ...
}
```

- [ ] **Step 3: Remove `[data-theme="terminal"]` variable block** — lines 90-107

- [ ] **Step 4: Remove `[data-theme="steampunk"]` variable block** — lines 108-149

- [ ] **Step 5: Remove old theme scanlines** — lines 153-158:
Keep only `[data-theme="dark"] #scanlines` and `[data-theme="dark"] #scanlines::after`.

- [ ] **Step 6: Remove old theme portrait styles** — lines 296-301 (all 6 lines for cyber/terminal/steampunk)

- [ ] **Step 7: Remove `.theme-switcher` / `.theme-btn` CSS block** — lines 437-453 (entire block from `.theme-switcher` to `.theme-btn[data-theme="steampunk"]`)

- [ ] **Step 8: Remove `[data-theme="terminal"]` specific decorations** — lines 458-488.
Keep the `@keyframes gearSpin` if it's there (line 540), but remove `[data-theme="steampunk"] .intro-text h1::after` (line 539).

Actually, keep `@keyframes gearSpin` — it's used by the new `.settings-gear`.

- [ ] **Step 9: Remove `[data-theme="steampunk"]` decorations** — lines 490-540, except keep the `@keyframes gearSpin` at line 540.

- [ ] **Step 10: Remove `[data-theme="cyber"]` and `[data-theme="terminal"]` project card blocks**:
  - Lines 580-607 (`[data-theme="cyber"] .project-card`)
  - Lines 610-642 (`[data-theme="terminal"] .project-card`)

- [ ] **Step 11: Remove old `.theme-switcher` responsive rule** — line ~698

- [ ] **Step 12: Remove `.mode-toggle` and `.theme-toggle` CSS in business mode section**:
  - Lines 898-922 (`.mode-toggle` block)
  - Lines 924-948 (`.theme-toggle` block)
  - Line 945 (`[data-mode="desktop"] .theme-toggle`)
  - Line 946-948 (`[data-mode="business"][data-theme="light"] .theme-toggle`)
  - Lines 1777-1780 (`.mode-toggle` light theme override)

- [ ] **Step 13: Remove `.cat-tab.active::after` underline** — lines 1233-1242 in the business mode CSS

- [ ] **Step 14: Remove old responsive `.mode-toggle` rule** — lines 1823-1828

- [ ] **Step 15: Verify no broken CSS** — search for any remaining `[data-theme="cyber"]`, `[data-theme="steampunk"]`, `[data-theme="terminal"]` references

Run: `grep -n "data-theme=\"cyber\"\|data-theme=\"steampunk\"\|data-theme=\"terminal\"" index.html`
Expected: only results should be in the `data-theme="dark"` block and `data-theme="light"` blocks.

- [ ] **Step 16: Commit**

```bash
git add index.html
git commit -m "refactor: remove legacy theme CSS (cyber/steampunk/terminal), old toggle CSS, cat-tab underline"
```

---
### Task 6: Clean up legacy CSS variables and remaining theme references

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Check for remaining legacy theme variables in the `:root` block** — read lines 52-149

If the `[data-theme="dark"]` block at lines 52-70 references variables like `--glow`, `--glow-strong`, `--accent2`, `--font` that were shared with other themes, keep them (they might still be used by business/desktop/terminal modes).

- [ ] **Step 2: Check for any remaining JS references** to old theme names

Run: `grep -rn "cyber\|steampunk" src/`
Expected: no references

- [ ] **Step 3: Run the dev server and verify**

```bash
npx vite
```
Then open browser — check:
- Business mode: gear rotates next to name, click opens popup, Dark/Light works, mode switch works
- Desktop mode: gear in system tray, click opens popup
- Terminal mode: gear in top-left, click opens popup
- All modes: popup close works (button, backdrop click, Escape)
- No console errors

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "chore: cleanup remaining legacy theme references"
```

---
### Task 7: Remove old CSS dark-theme project card decorations (optional)

**Files:**
- Modify: `index.html`

The `[data-theme="dark"] .project-card` decorations at lines 545-578 may still be actively used (dark theme is the default). Skip if they're still wanted. They apply decorative border/glow effects to project cards in the default dark theme.

**Decision:** Keep `[data-theme="dark"] .project-card` block (lines 545-578) — it styles project cards for the dark theme which is still active.

- [ ] **Step 1: No changes needed** — verify `[data-theme="dark"]` project card styles still work

- [ ] **Step 2: Final verification** — run the full audit:

```bash
node full_audit.cjs
```

- [ ] **Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "fix: final adjustments after theme cleanup"
```
