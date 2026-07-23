# Desktop OS Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Desktop OS" mode to portfolio — a Linux DE-style desktop with windows, icons, taskbar.

**Architecture:** Theme switching extended to support 3 modes (desktop / terminal / business). Desktop mode renders via JS: WindowManager class + app renderers. All CSS in index.html. All content from PONYTAIL.LOCALE.

**Tech Stack:** Vanilla JS (no frameworks), CSS custom properties, existing PONYTAIL config.

## Global Constraints

- No new npm dependencies
- All CSS in `index.html` `<style>` block
- All content from `PONYTAIL.LOCALE`
- Desktop mode hides 3D canvas (`#webgl` display:none)
- Must coexist with existing site (business mode unchanged)
- State in `localStorage` via `superpowers.state.js`

---

### Task 1: Theme Mode Infrastructure

**Files:**
- Create: `src/themes/themeManager.js`
- Modify: `index.html` (CSS)
- Modify: `src/main.js` (init + theme switching)

**Interfaces:**
- Consumes: `data-theme` attribute (existing), `superpowers.state.js`
- Produces: `window.__themeMode` — current mode string: `'desktop'` | `'business'` | `'terminal'`
- Produces: custom event `mode:change` dispatched on `document`

- [ ] **Step 1: Create themeManager.js**

```js
// src/themes/themeManager.js
const MODES = ['business', 'desktop', 'terminal']

export function getMode() {
  return document.documentElement.getAttribute('data-mode') || 'business'
}

export function setMode(mode) {
  if (!MODES.includes(mode)) return
  const prev = getMode()
  if (prev === mode) return
  document.documentElement.setAttribute('data-mode', mode)
  localStorage.setItem('portfolio-mode', mode)
  document.dispatchEvent(new CustomEvent('mode:change', { detail: { from: prev, to: mode } }))
}

export function initMode() {
  const saved = localStorage.getItem('portfolio-mode')
  if (saved && MODES.includes(saved)) {
    document.documentElement.setAttribute('data-mode', saved)
  }
}

export { MODES }
```

- [ ] **Step 2: Add mode-switching CSS in index.html**

```css
/* Add after existing theme rules */
[data-mode="desktop"] #webgl { display: none !important; }
[data-mode="desktop"] #scanlines { display: none !important; }
[data-mode="desktop"] .spacer { display: none; }
[data-mode="desktop"] #scrollProgress { display: none; }
[data-mode="desktop"] #scene-label { display: none; }
[data-mode="desktop"] .scroll-progress { display: none; }
[data-mode="desktop"] .intro-text { display: none; }
[data-mode="desktop"] .section-overlay { display: none; }
[data-mode="desktop"] .form-section { display: none; }
[data-mode="desktop"] .fps-counter { display: none; }
[data-mode="desktop"] .coffee-egg { display: none; }
[data-mode="desktop"] [data-lang-switch] { display: none; }
[data-mode="desktop"] .theme-switcher { display: none; }

[data-mode="desktop"] #desktop-shell { display: flex !important; }

/* Hide desktop shell in non-desktop modes */
#desktop-shell { display: none; }
[data-mode="business"] #desktop-shell { display: none; }
```

- [ ] **Step 3: Add desktop HTML shell to index.html**

```html
<!-- Add after #page404, before <script> -->
<div id="desktop-shell">
  <div id="desktop-canvas"></div>
  <div id="taskbar">
    <button id="start-btn">Applications</button>
    <div id="taskbar-windows"></div>
    <div id="taskbar-tray">
      <span id="taskbar-clock"></span>
    </div>
  </div>
  <div id="start-menu" style="display:none"></div>
</div>
```

- [ ] **Step 4: Wire mode init in main.js**

```js
// At top of main.js, after imports, add:
import { initMode } from './themes/themeManager.js'
initMode()

// After ScrollTrigger setup, add mode listener:
import { getMode } from './themes/themeManager.js'
if (getMode() === 'desktop') {
  renderer.setAnimationLoop(null)
  canvas.style.display = 'none'
}
```

- [ ] **Step 5: Commit**

```bash
git add src/themes/themeManager.js index.html src/main.js
git commit -m "feat: add theme mode infrastructure (desktop/business/terminal)"
```

---

### Task 2: Window Manager

**Files:**
- Create: `src/themes/desktop/windowManager.js`

**Interfaces:**
- Consumes: `PONYTAIL.LOCALE[lang]` for content
- Produces: `WindowManager` class exported as default
- API: `new WindowManager(container)` → `.open(title, contentHTML, icon, width, height)` → returns windowId
- API: `.close(id)`, `.focus(id)`, `.minimize(id)`, `.isOpen(id)`, `.getAll()`

- [ ] **Step 1: Create windowManager.js**

```js
// src/themes/desktop/windowManager.js
let _idCounter = 0

export default class WindowManager {
  constructor(containerEl) {
    this.el = containerEl
    this.windows = new Map()
    this.zIndex = 100
    this.dragState = null
    this._bind()
  }

  open(title, content, icon, width = 600, height = 400) {
    const id = ++_idCounter
    const win = document.createElement('div')
    win.className = 'desktop-win'
    win.dataset.winId = id
    win.style.cssText = `width:${width}px;height:${height}px;z-index:${++this.zIndex};left:${30 + (id * 20)}px;top:${30 + (id * 20)}px`
    win.innerHTML = `
      <div class="desktop-win-titlebar">
        <span class="desktop-win-icon">${icon || ''}</span>
        <span class="desktop-win-title">${title}</span>
        <div class="desktop-win-btns">
          <button data-win-min="${id}">—</button>
          <button data-win-max="${id}">□</button>
          <button data-win-close="${id}">✕</button>
        </div>
      </div>
      <div class="desktop-win-body">${content}</div>
      <div class="desktop-win-resize" data-win-resize="${id}"></div>`
    this.el.appendChild(win)
    this.windows.set(id, { el: win, title, minimized: false })
    this._addToTaskbar(id, title)
    this.focus(id)
    return id
  }

  close(id) {
    const w = this.windows.get(id)
    if (!w) return
    w.el.remove()
    this.windows.delete(id)
    this._removeFromTaskbar(id)
  }

  focus(id) {
    const w = this.windows.get(id)
    if (!w) return
    w.el.style.zIndex = ++this.zIndex
    w.el.classList.remove('desktop-win-minimized')
    // Visual focus indicator
    this.windows.forEach((ww) => ww.el.classList.remove('desktop-win-active'))
    w.el.classList.add('desktop-win-active')
    this._updateTaskbarActive(id)
  }

  minimize(id) {
    const w = this.windows.get(id)
    if (!w) return
    w.minimized = !w.minimized
    w.el.classList.toggle('desktop-win-minimized', w.minimized)
  }

  isOpen(id) { return this.windows.has(id) }
  getAll() { return [...this.windows.entries()].map(([id, w]) => ({ id, title: w.title })) }

  // --- Internal ---
  _bind() {
    this.el.addEventListener('mousedown', (e) => {
      const titlebar = e.target.closest('.desktop-win-titlebar')
      const win = e.target.closest('.desktop-win')
      if (win) this.focus(Number(win.dataset.winId))
      if (titlebar && win && !e.target.closest('.desktop-win-btns')) {
        this._startDrag(e, win)
      }
    })
    this.el.addEventListener('click', (e) => {
      const close = e.target.closest('[data-win-close]')
      if (close) this.close(Number(close.dataset.winClose))
      const min = e.target.closest('[data-win-min]')
      if (min) this.minimize(Number(min.dataset.winMin))
      const max = e.target.closest('[data-win-max]')
      if (max) this._toggleMaximize(Number(max.dataset.winMax))
    })
    // Resize
    this.el.addEventListener('mousedown', (e) => {
      const r = e.target.closest('[data-win-resize]')
      if (!r) return
      const win = r.closest('.desktop-win')
      if (!win) return
      this._resizeStart(e, win, r)
    })
    // Taskbar click to restore
    document.getElementById('taskbar-windows')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-taskbar-id]')
      if (!btn) return
      const id = Number(btn.dataset.taskbarId)
      const w = this.windows.get(id)
      if (!w) return
      if (w.minimized) { this.focus(id); w.minimized = false; w.el.classList.remove('desktop-win-minimized') }
      else if (w.el.classList.contains('desktop-win-active')) { this.minimize(id) }
      else { this.focus(id) }
    })
  }

  _startDrag(e, win) {
    const rect = win.getBoundingClientRect()
    this.dragState = { win, dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    const onMove = (ev) => {
      if (!this.dragState) return
      this.dragState.win.style.left = (ev.clientX - this.dragState.dx) + 'px'
      this.dragState.win.style.top = (ev.clientY - this.dragState.dy) + 'px'
    }
    const onUp = () => { this.dragState = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  _resizeStart(e, win, handle) {
    const rect = win.getBoundingClientRect()
    const onMove = (ev) => {
      win.style.width = Math.max(300, ev.clientX - rect.left) + 'px'
      win.style.height = Math.max(200, ev.clientY - rect.top) + 'px'
    }
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  _toggleMaximize(id) {
    const w = this.windows.get(id)
    if (!w) return
    if (w.el.classList.toggle('desktop-win-maximized')) {
      w._saved = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height }
      w.el.style.cssText += ';left:0!important;top:0!important;width:100%!important;height:calc(100% - 40px)!important'
    } else {
      const s = w._saved || {}
      w.el.style.cssText = `left:${s.left || '50px'};top:${s.top || '50px'};width:${s.width || '600px'};height:${s.height || '400px'};z-index:${++this.zIndex}`
      w.el.classList.remove('desktop-win-maximized')
    }
  }

  _addToTaskbar(id, title) {
    const tb = document.getElementById('taskbar-windows')
    if (!tb) return
    const btn = document.createElement('button')
    btn.className = 'taskbar-btn'
    btn.dataset.taskbarId = id
    btn.textContent = title
    tb.appendChild(btn)
  }

  _removeFromTaskbar(id) {
    document.querySelector(`[data-taskbar-id="${id}"]`)?.remove()
  }

  _updateTaskbarActive(id) {
    document.querySelectorAll('.taskbar-btn').forEach(b => b.classList.remove('active'))
    document.querySelector(`[data-taskbar-id="${id}"]`)?.classList.add('active')
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/themes/desktop/windowManager.js
git commit -m "feat: add WindowManager — drag, resize, minimize, maximize, close"
```

---

### Task 3: Desktop Shell + CSS

**Files:**
- Create: `src/themes/desktop/desktop.js`
- Modify: `index.html` (CSS for desktop theme, ~100 lines)

- [ ] **Step 1: Add Desktop CSS to index.html**

```css
/* Add at end of <style> block, before @media prefers-reduced-motion */

/* === DESKTOP OS THEME === */
[data-mode="desktop"] {
  --desktop-bg: #2e3436;
  --desktop-panel: #3a3f42;
  --desktop-text: #ffffff;
  --desktop-titlebar: #2a2e30;
  --desktop-titlebar-active: #4a90d9;
  --desktop-border: #555;
  --desktop-hover: rgba(255,255,255,.08);
  --desktop-font: 'Inter', system-ui, sans-serif;
}

#desktop-shell {
  position: fixed; inset: 0; z-index: 2;
  flex-direction: column; font-family: var(--desktop-font);
  color: var(--desktop-text); overflow: hidden;
  background: var(--desktop-bg);
}

#desktop-canvas {
  flex: 1; position: relative;
  display: grid; grid-template-columns: repeat(auto-fill, 80px);
  grid-auto-rows: 90px; gap: 4px; align-content: start;
  padding: 16px; overflow-y: auto;
}

/* Desktop Icons */
.desktop-icon {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 4px; padding: 8px 4px;
  border-radius: 8px; cursor: pointer; user-select: none;
  border: 2px solid transparent; transition: background .15s;
  width: 80px; height: 90px;
}
.desktop-icon:hover { background: var(--desktop-hover); }
.desktop-icon:active { background: rgba(255,255,255,.12); }
.desktop-icon .icon-svg { width: 48px; height: 48px; flex-shrink: 0; }
.desktop-icon .icon-label {
  font-size: 11px; text-align: center; line-height: 1.2;
  word-break: break-word; max-width: 76px;
}

/* Taskbar */
#taskbar {
  height: 40px; background: var(--desktop-panel);
  display: flex; align-items: center; padding: 0 4px;
  border-top: 1px solid var(--desktop-border); flex-shrink: 0;
  z-index: 999;
}
#start-btn {
  padding: 4px 14px; margin-right: 4px; border-radius: 4px;
  background: var(--desktop-titlebar); color: var(--desktop-text);
  border: 1px solid var(--desktop-border); cursor: pointer;
  font-family: var(--desktop-font); font-size: 13px; white-space: nowrap;
}
#start-btn:hover { background: var(--desktop-titlebar-active); }
#taskbar-windows { display: flex; gap: 2px; flex: 1; overflow-x: auto; }
.taskbar-btn {
  padding: 4px 12px; border-radius: 4px; white-space: nowrap;
  background: transparent; color: var(--desktop-text);
  border: 1px solid transparent; cursor: pointer;
  font-family: var(--desktop-font); font-size: 12px; max-width: 160px;
  overflow: hidden; text-overflow: ellipsis;
}
.taskbar-btn:hover { background: var(--desktop-hover); }
.taskbar-btn.active { background: var(--desktop-titlebar-active); border-color: rgba(255,255,255,.2); }
#taskbar-tray { display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 12px; flex-shrink: 0; }

/* Windows */
.desktop-win {
  position: absolute; display: flex; flex-direction: column;
  border-radius: 8px; overflow: hidden;
  background: #2a2e30; border: 1px solid var(--desktop-border);
  box-shadow: 0 8px 32px rgba(0,0,0,.4);
}
.desktop-win.desktop-win-minimized { display: none; }
.desktop-win.desktop-win-maximized { border-radius: 0; }
.desktop-win-titlebar {
  height: 36px; display: flex; align-items: center; gap: 6px;
  padding: 0 8px; background: var(--desktop-titlebar); cursor: default;
  flex-shrink: 0; user-select: none;
}
.desktop-win-active .desktop-win-titlebar { background: var(--desktop-titlebar-active); }
.desktop-win-icon { font-size: 16px; width: 20px; text-align: center; }
.desktop-win-title { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.desktop-win-btns { display: flex; gap: 2px; }
.desktop-win-btns button {
  width: 28px; height: 24px; border: none; background: transparent;
  color: var(--desktop-text); cursor: pointer; border-radius: 4px;
  font-size: 14px; line-height: 24px; text-align: center; padding: 0;
}
.desktop-win-btns button:hover { background: rgba(255,255,255,.15); }
.desktop-win-btns [data-win-close]:hover { background: #e81123; }
.desktop-win-body {
  flex: 1; overflow-y: auto; background: #ffffff; color: #1a1a1a;
  padding: 16px; font-size: 14px; line-height: 1.5;
}
.desktop-win-body::-webkit-scrollbar { width: 6px; }
.desktop-win-body::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
.desktop-win-resize {
  position: absolute; bottom: 0; right: 0; width: 16px; height: 16px;
  cursor: nw-resize; z-index: 10;
}

/* Start Menu */
#start-menu {
  position: absolute; bottom: 40px; left: 0; z-index: 1000;
  background: var(--desktop-panel); border: 1px solid var(--desktop-border);
  border-radius: 8px 8px 0 0; padding: 6px; min-width: 200px;
  box-shadow: 0 -4px 20px rgba(0,0,0,.3);
}
.start-menu-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 6px; cursor: pointer;
  font-size: 13px; color: var(--desktop-text);
}
.start-menu-item:hover { background: var(--desktop-hover); }
.start-menu-item .icon-svg { width: 24px; height: 24px; }
.start-menu-divider { height: 1px; background: var(--desktop-border); margin: 4px 0; }

/* App: File Manager Layout */
.fm-layout { display: flex; height: 100%; gap: 0; }
.fm-sidebar { width: 180px; flex-shrink: 0; border-right: 1px solid #ddd; padding: 8px; }
.fm-sidebar-item { padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.fm-sidebar-item:hover { background: #e8e8e8; }
.fm-sidebar-item.active { background: #d0d0d0; font-weight: 600; }
.fm-content { flex: 1; padding: 8px; display: flex; flex-wrap: wrap; gap: 8px; align-content: start; }
.fm-file {
  width: 100px; padding: 8px; border-radius: 6px; cursor: pointer;
  text-align: center; font-size: 12px; transition: background .15s;
}
.fm-file:hover { background: #e8e8e8; }
.fm-file .icon-svg { width: 32px; height: 32px; margin: 0 auto 4px; }
.fm-file-name { word-break: break-word; }

/* App: About */
.about-card { max-width: 500px; margin: 0 auto; text-align: center; }
.about-name { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.about-role { color: #666; margin-bottom: 16px; }
.about-tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 16px; }
.about-tag { padding: 4px 12px; background: #e8e8e8; border-radius: 20px; font-size: 12px; }
.about-links { display: flex; gap: 12px; justify-content: center; }
.about-links a { color: var(--desktop-titlebar-active); text-decoration: none; font-size: 13px; }

/* App: Mail */
.mail-form { max-width: 400px; margin: 0 auto; }
.mail-form label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.mail-form input, .mail-form textarea {
  width: 100%; padding: 8px 10px; margin-bottom: 12px;
  border: 1px solid #ccc; border-radius: 4px; font-size: 14px;
  font-family: var(--desktop-font);
}
.mail-form input:focus, .mail-form textarea:focus { border-color: var(--desktop-titlebar-active); outline: none; }
.mail-form button {
  padding: 8px 20px; background: var(--desktop-titlebar-active); color: #fff;
  border: none; border-radius: 4px; cursor: pointer; font-size: 14px;
}
.mail-form button:hover { opacity: .9; }

/* App: Achievement List */
.ach-list { display: flex; flex-direction: column; gap: 8px; }
.ach-item { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; }
.ach-year { font-size: 11px; color: var(--desktop-titlebar-active); font-weight: 600; }
.ach-title { font-size: 14px; font-weight: 600; margin: 2px 0; }
.ach-desc { font-size: 12px; color: #666; }

/* App: Settings */
.settings-group { margin-bottom: 16px; }
.settings-label { font-size: 13px; font-weight: 600; margin-bottom: 8px; display: block; }
.settings-option { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; }
.settings-option input { margin: 0; }
```

- [ ] **Step 2: Create desktop.js**

```js
// src/themes/desktop/desktop.js
import PONYTAIL from '../../config/ponytail.config.js'
import WindowManager from './windowManager.js'

let wm = null
let _lang = 'EN'

function l() { return PONYTAIL.LOCALE[_lang] }

// SVG icons data (minimal inline SVGs)
const ICONS = {
  about: '<svg viewBox="0 0 48 48" fill="none" stroke="#4a90d9" stroke-width="2"><circle cx="24" cy="24" r="20"/><circle cx="24" cy="16" r="4" fill="#4a90d9"/><path d="M16 34c0-4 3.6-8 8-8s8 4 8 8"/></svg>',
  folder: '<svg viewBox="0 0 48 48" fill="none" stroke="#f0c040" stroke-width="2"><path d="M6 10h14l4 6h18v22H6z"/></svg>',
  file: '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="2"><path d="M10 4h18l12 12v28H10z"/><path d="M28 4v12h12" fill="none"/></svg>',
  mail: '<svg viewBox="0 0 48 48" fill="none" stroke="#4a90d9" stroke-width="2"><rect x="4" y="10" width="40" height="28" rx="4"/><path d="M4 14l20 14 20-14"/></svg>',
  ach: '<svg viewBox="0 0 48 48" fill="none" stroke="#f0c040" stroke-width="2"><path d="M24 4l5 10 11 1-8 7 2 11-10-6-10 6 2-11-8-7 11-1z"/></svg>',
  career: '<svg viewBox="0 0 48 48" fill="none" stroke="#4a90d9" stroke-width="2"><rect x="8" y="14" width="32" height="26" rx="4"/><path d="M16 14V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4"/><circle cx="24" cy="26" r="4" fill="#4a90d9"/><path d="M18 34c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
  omni: '<svg viewBox="0 0 48 48" fill="none" stroke="#00cc88" stroke-width="2"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="6"/><path d="M8 24h32M24 8v32"/></svg>',
  settings: '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="2"><circle cx="24" cy="24" r="8"/><path d="M24 2v6m0 32v6M2 24h6m32 0h6M8.5 8.5l4.2 4.2m22.6 22.6l4.2 4.2M8.5 39.5l4.2-4.2m22.6-22.6l4.2-4.2"/></svg>',
}

function icon(name) { return `<span class="icon-svg">${ICONS[name] || ICONS.file}</span>` }

function createDesktopIcon(label, iconName, onclick) {
  const el = document.createElement('div')
  el.className = 'desktop-icon'
  el.innerHTML = icon(iconName) + `<span class="icon-label">${label}</span>`
  el.addEventListener('dblclick', onclick)
  return el
}

function renderAbout() {
  const data = l()
  return `<div class="about-card">
    <div class="about-name">${data.NAME}</div>
    <div class="about-role">${data.ROLE}</div>
    <div>${data.INTRO_SUB}</div>
    <div class="about-tags">${['Go','Rust','Python','TypeScript','Kubernetes','Kafka','React'].map(t => `<span class="about-tag">${t}</span>`).join('')}</div>
    <div class="about-links">
      <a href="https://github.com/RF24KRSK" target="_blank">GitHub</a>
      <a href="https://linkedin.com/in/aleksandr-gribakin" target="_blank">LinkedIn</a>
      <a href="mailto:RF24KRSK@gmail.com">Email</a>
    </div>
  </div>`
}

function renderFileManager() {
  const data = l()
  const cats = data.CATEGORIES
  let activeCat = cats[0]
  const projects = data.PROJECTS
  const sidebar = cats.map((c, i) => `<div class="fm-sidebar-item${i === 0 ? ' active' : ''}" data-fm-cat="${c}">${data.CATEGORY_LABELS[i] || c}</div>`).join('')
  const content = (cat) => {
    const filtered = cat === cats[0] ? projects : projects.filter(p => p.cat === cat)
    return filtered.map(p => `<div class="fm-file" data-project-id="${p.id}">
      <div class="file-icon">${icon('file')}</div>
      <div class="fm-file-name">${p.name}</div>
    </div>`).join('')
  }
  const html = `<div class="fm-layout">
    <div class="fm-sidebar">${sidebar}</div>
    <div class="fm-content" id="fm-content">${content(activeCat)}</div>
  </div>`
  return { html, init: (winId) => {
    document.querySelector(`[data-win-id="${winId}"]`)?.addEventListener('click', (e) => {
      const catItem = e.target.closest('.fm-sidebar-item')
      if (catItem) {
        document.querySelectorAll('.fm-sidebar-item').forEach(c => c.classList.remove('active'))
        catItem.classList.add('active')
        const cat = catItem.dataset.fmCat
        const contentEl = document.querySelector(`[data-win-id="${winId}"] #fm-content`)
        if (contentEl) contentEl.innerHTML = content(cat)
      }
      const proj = e.target.closest('[data-project-id]')
      if (proj) {
        const pid = proj.dataset.projectId
        const p = projects.find(pp => pp.id === pid)
        if (p) {
          const detail = `<div><h2>${p.name}</h2><p style="color:#666;font-size:12px">${p.stack}</p><p style="margin-top:12px">${p.desc}</p><p style="margin-top:8px;font-weight:600">${p.metric}</p></div>`
          wm.open(p.name, detail, ICONS.file, 500, 300)
        }
      }
    })
  }}
}

function renderCareer() {
  const data = l()
  const items = data.CAREER.map(c => `<div class="ach-item">
    <div class="ach-year">${c.period}</div>
    <div class="ach-title">${c.role} <span style="color:#666;font-weight:400">@ ${c.company}</span></div>
    <div class="ach-desc">${c.desc}</div>
  </div>`).join('')
  return `<div class="ach-list">${items}</div>`
}

function renderAchievements() {
  const data = l()
  const items = data.ACHIEVEMENTS.map(a => `<div class="ach-item">
    <div class="ach-year">${a.year}</div>
    <div class="ach-title">${a.title}</div>
    <div class="ach-desc">${a.desc}</div>
  </div>`).join('')
  return `<div class="ach-list">${items}</div>`
}

function renderMail() {
  const f = l().FORM
  return `<div class="mail-form">
    <label>${f.NAME}</label>
    <input type="text" id="mail-name" placeholder="${f.PLACEHOLDER_NAME}" />
    <label>${f.EMAIL}</label>
    <input type="email" id="mail-email" placeholder="${f.PLACEHOLDER_EMAIL}" />
    <label>${f.MESSAGE}</label>
    <textarea id="mail-msg" rows="4" placeholder="${f.PLACEHOLDER_MSG}"></textarea>
    <button id="mail-send">${f.SUBMIT}</button>
    <div id="mail-status" style="margin-top:8px;font-size:12px"></div>
  </div>`
}

function renderOmni() {
  return `<div style="text-align:center;padding:20px">
    <div style="font-size:32px;font-weight:200;margin-bottom:16px">Aura-Omnimesh</div>
    <div style="display:flex;justify-content:center;margin-bottom:20px">${ICONS.omni}</div>
    <div style="padding:12px 20px;background:#e8f8f0;border-radius:8px;color:#006644;font-size:13px">
      Description coming soon
    </div>
  </div>`
}

function renderSettings() {
  return `<div class="settings-group">
    <span class="settings-label">Theme</span>
    <label class="settings-option"><input type="radio" name="mode" value="desktop" checked> Desktop OS</label>
    <label class="settings-option"><input type="radio" name="mode" value="business"> Business</label>
    <label class="settings-option"><input type="radio" name="mode" value="terminal"> Terminal</label>
    <span class="settings-label" style="margin-top:12px">Language</span>
    <label class="settings-option"><input type="radio" name="lang" value="EN" ${_lang === 'EN' ? 'checked' : ''}> English</label>
    <label class="settings-option"><input type="radio" name="lang" value="RU" ${_lang === 'RU' ? 'checked' : ''}> Русский</label>
  </div>`
}

export function initDesktop() {
  const shell = document.getElementById('desktop-shell')
  const canvas = document.getElementById('desktop-canvas')
  if (!shell || !canvas) return
  _lang = localStorage.getItem('active_language') || 'EN'

  wm = new WindowManager(shell)

  // Desktop icons
  const icons = [
    createDesktopIcon('About Me', 'about', () => wm.open('About Me', renderAbout(), ICONS.about, 480, 360)),
    createDesktopIcon('Projects', 'folder', () => { const r = renderFileManager(); const id = wm.open('File Manager', r.html, ICONS.folder, 700, 450); if (r.init) r.init(id) }),
    createDesktopIcon('Career', 'career', () => wm.open('Career', renderCareer(), ICONS.career, 600, 400)),
    createDesktopIcon('Achievements', 'ach', () => wm.open('Achievements', renderAchievements(), ICONS.ach, 600, 400)),
    createDesktopIcon('Aura-Omnimesh', 'omni', () => wm.open('Aura-Omnimesh', renderOmni(), ICONS.omni, 480, 300)),
    createDesktopIcon('Mail', 'mail', () => { const id = wm.open('Mail', renderMail(), ICONS.mail, 450, 380); setTimeout(() => wireMailForm(id), 100) }),
    createDesktopIcon('Settings', 'settings', () => {
      const id = wm.open('Settings', renderSettings(), ICONS.settings, 380, 280)
      setTimeout(() => wireSettings(id), 100)
    }),
  ]
  icons.forEach(el => canvas.appendChild(el))

  // Clock
  updateClock()
  setInterval(updateClock, 1000)

  // Start menu
  const startBtn = document.getElementById('start-btn')
  const startMenu = document.getElementById('start-menu')
  startBtn.addEventListener('click', () => { startMenu.style.display = startMenu.style.display === 'none' ? 'block' : 'none' })
  document.addEventListener('click', (e) => { if (!e.target.closest('#start-btn') && !e.target.closest('#start-menu')) startMenu.style.display = 'none' })
  buildStartMenu()

  // Close start menu on item click
  startMenu.addEventListener('click', () => { startMenu.style.display = 'none' })
}

function updateClock() {
  const el = document.getElementById('taskbar-clock')
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function buildStartMenu() {
  const menu = document.getElementById('start-menu')
  const items = [
    { label: 'About Me', icon: 'about', action: () => wm.open('About Me', renderAbout(), ICONS.about, 480, 360) },
    { label: 'File Manager', icon: 'folder', action: () => { const r = renderFileManager(); const id = wm.open('File Manager', r.html, ICONS.folder, 700, 450); if (r.init) r.init(id) } },
    { label: 'Career', icon: 'career', action: () => wm.open('Career', renderCareer(), ICONS.career, 600, 400) },
    { label: 'Achievements', icon: 'ach', action: () => wm.open('Achievements', renderAchievements(), ICONS.ach, 600, 400) },
    { label: 'Aura-Omnimesh', icon: 'omni', action: () => wm.open('Aura-Omnimesh', renderOmni(), ICONS.omni, 480, 300) },
    { label: 'Mail', icon: 'mail', action: () => { const id = wm.open('Mail', renderMail(), ICONS.mail, 450, 380); setTimeout(() => wireMailForm(id), 100) } },
    null, // divider
    { label: 'Settings', icon: 'settings', action: () => { const id = wm.open('Settings', renderSettings(), ICONS.settings, 380, 280); setTimeout(() => wireSettings(id), 100) } },
  ]
  menu.innerHTML = items.map(item => {
    if (!item) return '<div class="start-menu-divider"></div>'
    return `<div class="start-menu-item" data-start="${item.label}">${icon(item.icon)}${item.label}</div>`
  }).join('')
  menu.addEventListener('click', (e) => {
    const el = e.target.closest('.start-menu-item')
    if (!el) return
    const item = items.find(i => i && i.label === el.dataset.start)
    if (item) item.action()
  })
}

function wireMailForm(winId) {
  const win = document.querySelector(`[data-win-id="${winId}"]`)
  if (!win) return
  win.querySelector('#mail-send')?.addEventListener('click', async () => {
    const name = win.querySelector('#mail-name')?.value
    const email = win.querySelector('#mail-email')?.value
    const message = win.querySelector('#mail-msg')?.value
    const status = win.querySelector('#mail-status')
    if (!name || !email || !message) { status.textContent = 'Fill all fields'; return }
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, to: 'RF24KRSK@gmail.com' }),
      })
      if (res.ok) status.textContent = '✓ Message sent!'
      else status.textContent = 'Error. Try again.'
    } catch { status.textContent = 'Network error.' }
  })
}

function wireSettings(winId) {
  const win = document.querySelector(`[data-win-id="${winId}"]`)
  if (!win) return
  win.querySelectorAll('[name="mode"]').forEach(r => {
    r.addEventListener('change', () => {
      if (r.checked) {
        import('../themeManager.js').then(m => m.setMode(r.value))
      }
    })
  })
  win.querySelectorAll('[name="lang"]').forEach(r => {
    r.addEventListener('change', () => {
      if (r.checked) {
        localStorage.setItem('active_language', r.value)
        location.reload()
      }
    })
  })
}
```

- [ ] **Step 3: Wire desktop init in main.js**

```js
// After theme buttons setup in main.js, add:
if (getMode() === 'desktop') {
  import('./themes/desktop/desktop.js').then(m => m.initDesktop())
}

// Also add mode:change listener:
document.addEventListener('mode:change', (e) => {
  if (e.detail.to === 'desktop') {
    location.reload()
  }
})
```

- [ ] **Step 4: Add mode switch UI to existing theme switcher**

```html
<!-- Add a mode toggle UI somewhere accessible -->
```

- [ ] **Step 5: Commit**

```bash
git add src/themes/desktop/desktop.js index.html src/main.js
git commit -m "feat: desktop OS theme — shell, icons, windows, apps"
```

---

### Verification

- [ ] **Build passes**

```bash
npx vite build
```

- [ ] **Manual test checklist**
  - Switch to desktop mode via Settings or localStorage
  - Desktop icons appear with correct labels
  - Double-click About → opens window with bio
  - Double-click Projects → File Manager with sidebar category filter
  - Click a project file → opens README window
  - Drag window by titlebar
  - Resize by bottom-right corner
  - Close/minimize/maximize buttons work
  - Taskbar shows open windows, click to focus/minimize
  - Start menu opens, items open windows
  - Mail form submits to /api/consult
  - Settings can switch mode/language
  - Switch back to business mode — original site works
  - Desktop on mobile is usable (scrolls, windows work)
