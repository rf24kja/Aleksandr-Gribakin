# Settings Gear — Unified Theme & Mode Switcher

## Motivation
Replace the scattered, redundant theme/mode UIs with a single gear icon that opens a settings popup. Remove legacy 4-theme system (cyber, steampunk, terminal-as-theme, dark-as-theme) keeping only data-mode business/desktop/terminal.

## Scope
- Single spinning gear icon → settings popup
- Popup: Dark/Light toggle (labeled "Business mode only") + Interface mode selector (Business / Desktop / Terminal)
- Remove old `.theme-switcher` (4 circle buttons), `[data-theme-switch]`, `[data-mode-switch]` standalone elements
- Clean up: delete stale theme CSS blocks for cyber/steampunk/terminal-as-theme
- Remove `.cat-tab.active::after` underline in business mode

## Design

### Gear Placement

| Mode    | Position |
|---------|----------|
| Business | Inside `<h1>`, after `/>` — `<span class="settings-gear">⚙</span>`, spinning animation |
| Desktop  | In `#system-tray`, after `#tray-clock` |
| Terminal | In `#ui-overlay`, left side replacing old theme-btn cluster |

All placements use a single CSS class `.settings-gear` with `cursor:pointer`.

### Settings Popup (`.settings-popup`)
Modal overlay with centered card:

```
┌──────────────────────────────┐
│  ⚙  Settings                 │
│                              │
│  ◈ Theme                     │
│  [● Dark] [○ Light]          │
│  (Business mode only)        │
│                              │
│  ◈ Interface                 │
│  [● Business] [○ Desktop]    │
│  [○ Terminal]                │
│                              │
│  [✕  Close]                  │
└──────────────────────────────┘
```

- Closes on: Close button, click outside popup, Escape key
- Theme buttons: disabled (greyed out) when mode !== 'business'

### HTML Structure
```html
<button class="settings-gear" id="settingsGear" title="Settings">⚙</button>
<div class="settings-popup" id="settingsPopup" style="display:none">
  <div class="settings-backdrop"></div>
  <div class="settings-card">
    <div class="settings-header">⚙ <span data-i18n="SETTINGS">Settings</span></div>
    
    <div class="settings-section">
      <div class="settings-label">◈ <span data-i18n="SETTINGS_THEME">Theme</span></div>
      <div class="settings-theme-group">
        <button class="settings-opt" data-stheme="dark">🌙 Dark</button>
        <button class="settings-opt" data-stheme="light">☀ Light</button>
      </div>
      <div class="settings-hint" data-i18n="SETTINGS_THEME_HINT">(Business mode only)</div>
    </div>

    <div class="settings-section">
      <div class="settings-label">◈ <span data-i18n="SETTINGS_INTERFACE">Interface</span></div>
      <div class="settings-mode-group">
        <button class="settings-opt" data-smode="business">Business</button>
        <button class="settings-opt" data-smode="desktop">Desktop</button>
        <button class="settings-opt" data-smode="terminal">Terminal</button>
      </div>
    </div>

    <button class="settings-close" id="settingsClose">✕ <span data-i18n="SETTINGS_CLOSE">Close</span></button>
  </div>
</div>
```

### Behaviour (JS in `src/main.js`)
```js
// Gear click → show popup, populate from current data-mode / data-theme
// Theme opt click → applyTheme(val) — only if mode === 'business'
// Mode opt click → setMode(val), if terminal → _populateTerminalIntro()
// Close popup: button, backdrop click, Escape
// Close also if mode changes while popup open
```

**Cleanup of old handlers** — remove from `src/main.js`:
- `.theme-btn` click handler (the 4 circle buttons)
- `[data-mode-switch]` click handler (standalone mode toggle)
- `[data-theme-switch]` click handler (standalone theme toggle)

**Remove from HTML** (index.html):
- `.theme-switcher` div with its 4 buttons (lines ~2521-2526)
- `.mode-toggle` and `.theme-toggle` buttons (lines ~2528-2529)
- Standalone CSS for all of the above

### CSS Cleanup
Remove entire CSS blocks for:
- `[data-theme="cyber"]` (except body background / font that might bleed — verify)
- `[data-theme="steampunk"]` 
- `[data-theme="terminal"]` (the *theme* — NOT the same as `[data-mode="terminal"]`)
- `[data-theme="dark"]` selector blocks that were project-card decorations (verify they're not used by mode-based styling)
- The `.theme-switcher`, `.theme-btn`, `.theme-toggle`, `.mode-toggle` CSS

Keep ONLY:
- `[data-theme="dark"]` — used as base/default, but simplify
- `[data-theme="light"]` — used in business mode
- `[data-mode="business"]` blocks
- `[data-mode="desktop"]` blocks  
- `[data-mode="terminal"]` blocks

### Category Tabs
Remove `.cat-tab.active::after` from `[data-mode="business"]` CSS block (lines ~1233-1242).

### i18n
Add to `ponytail.config.js` EN/RU:
```js
SETTINGS: 'Settings' / 'Настройки'
SETTINGS_THEME: 'Theme' / 'Тема'
SETTINGS_THEME_HINT: '(Business mode only)' / '(Только для Business)'
SETTINGS_INTERFACE: 'Interface' / 'Интерфейс'
SETTINGS_CLOSE: 'Close' / 'Закрыть'
```

## Files Changed
- `index.html` — HTML + CSS changes
- `src/main.js` — new handler, removed old handlers
- `src/config/ponytail.config.js` — 5 new keys

## What NOT To Break
- `data-mode="business"` with `data-theme="dark"` or `data-theme="light"` — must remain intact
- `data-mode="desktop"` — must keep working
- `data-mode="terminal"` — must keep working
- `setMode()` / `applyTheme()` / `initMode()` — keep untouched
- Desktop shell, start menu, windows — no changes
- Terminal boot intro, sections — no changes
- Form validation — no changes
