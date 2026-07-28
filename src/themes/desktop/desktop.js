import PONYTAIL from '../../config/ponytail.config.js'
import { getMode, setMode, MODES } from '../themeManager.js'
import { computeStats, buildMetricScale } from '../../lib/stats.js'
import { PROJECTS_DETAIL, CAREER_DETAIL, ACHIEVEMENT_DETAIL } from '../../data/projects.js'
import { renderStatsForDesktop, renderMetricGrid, animateMetricGrid, esc } from '../../lib/statsUI.js'
import WindowManager from './windowManager.js'

const apps = []
let wm, state

function _(key) {
  const lang = state?.lang || 'EN'
  const locale = PONYTAIL.LOCALE[lang] || PONYTAIL.LOCALE.EN
  const parts = key.split('.')
  let v = locale
  for (const p of parts) { if (v && typeof v === 'object') v = v[p]; else return key }
  return v || key
}

function appIcon(svg) {
  return `<span class="desk-icon-icon" style="background:rgba(255,255,255,.06)">${svg}</span>`
}

const SVG = {
  about: '<svg viewBox="0 0 48 48" fill="none" stroke="#e95420" stroke-width="1.5" width="28" height="28"><circle cx="24" cy="16" r="8"/><path d="M8 44c0-8 7.2-14 16-14s16 6 16 14"/></svg>',
  career: '<svg viewBox="0 0 48 48" fill="none" stroke="#fbbb2d" stroke-width="1.5" width="28" height="28"><rect x="6" y="14" width="36" height="26" rx="3"/><path d="M34 14V8a2 2 0 0 0-2-2H16a2 2 0 0 0-2 2v6"/><circle cx="24" cy="28" r="5" fill="#fbbb2d"/></svg>',
  projects: '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="1.5" width="28" height="28"><path d="M42 38a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h12l4 6h16a2 2 0 0 1 2 2z"/></svg>',
  achievements: '<svg viewBox="0 0 48 48" fill="none" stroke="#fbbb2d" stroke-width="1.5" width="28" height="28"><polygon points="24 4 28.4 17.2 42 18 31.4 27.4 34.6 41 24 33.6 13.4 41 16.6 27.4 6 18 19.6 17.2 24 4" stroke-linejoin="round"/></svg>',
  aura: '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="1.5" width="28" height="28"><circle cx="24" cy="8" r="4"/><circle cx="8" cy="40" r="4"/><circle cx="40" cy="40" r="4"/><circle cx="24" cy="24" r="4"/><path d="M24 12v8M12 36l8-8M36 36l-8-8"/></svg>',
  mail: '<svg viewBox="0 0 48 48" fill="none" stroke="#e95420" stroke-width="1.5" width="28" height="28"><rect x="4" y="8" width="40" height="32" rx="4"/><path d="M4 12l20 16 20-16"/></svg>',
  settings: '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="1.5" width="28" height="28"><circle cx="24" cy="24" r="6"/><path d="M24 2v6m0 32v6M2 24h6m32 0h6M8.5 8.5l4.2 4.2m22.6 22.6l4.2 4.2M8.5 39.5l4.2-4.2m22.6-22.6l4.2-4.2" stroke-linecap="round"/></svg>',
}

function registerApp(id, label, svg, contentFn, opts = {}) {
  apps.push({ id, label, svg, contentFn, ...opts })
}

function renderDesktopIcons(container) {
  container.innerHTML = apps.map(a => `
    <div class="desk-icon" data-app="${a.id}">
      ${appIcon(a.svg)}
      <span class="desk-icon-label">${a.label}</span>
    </div>
  `).join('')
}

function renderStartMenu(container) {
  container.innerHTML = apps.map(a => `
    <div class="start-app-item" data-app="${a.id}">
      <span class="sai-icon">${a.svg}</span>
      ${a.label}
    </div>
  `).join('')
}

function openApp(id) {
  const app = apps.find(a => a.id === id)
  if (!app) return
  wm.open({ id: 'win-' + id, title: app.label, icon: app.svg, content: app.contentFn(), width: app.width || 520, height: app.height || 380 })
}

function updateTaskbar(state) {
  const tb = document.getElementById('taskbar-windows')
  if (!tb) return
  tb.innerHTML = state.list.map(w => `
    <button class="tb-window-btn${w.id === state.active && w.visible ? ' active' : ''}" data-win="${w.id}" style="${w.visible ? '' : 'opacity:.5'}">${w.title}</button>
  `).join('')

  const clock = document.getElementById('tray-clock')
  if (clock) {
    const now = new Date()
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

function initClock() {
  const clock = document.getElementById('tray-clock')
  if (!clock) return
  function tick() {
    const now = new Date()
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  tick()
  setInterval(tick, 30000)
}

function initModeSwitch() {
  const tray = document.getElementById('system-tray')
  if (!tray) return
  const btn = document.createElement('button')
  btn.className = 'tray-btn'
  btn.title = 'Switch mode'
  btn.textContent = '⇄'
  btn.style.color = 'var(--ubuntu-accent)'
  btn.addEventListener('click', () => {
    const modes = MODES
    const cur = getMode()
    const next = modes[(modes.indexOf(cur) + 1) % modes.length]
    setMode(next)
  })
  tray.appendChild(btn)
}

function renderAbout() {
  return `
    <div class="wb-title">${_('ROLE')}</div>
    <div class="wb-sub">${_('TAGLINE')}</div>
    <hr class="wb-divider">
    <div class="wb-text">${_('BIO') || 'Lead Full Stack Engineer & System Architect with 15 years of experience building at scale.'}</div>
    <div class="wb-section-title">${_('SECTION_TITLES.STATS')}</div>
    <div class="wb-text">${_('STATS_DESC') || 'Proven track record in fintech, ML systems, and distributed architectures.'}</div>
    ${renderStatsForDesktop(computeStats(state?.lang || 'EN'))}
  `
}

function renderCareer() {
  const career = _('CAREER')
  if (!Array.isArray(career)) return '<div class="wb-text">No data</div>'
  return career.map((c, i) => `
    <button type="button" class="wb-row" data-open="career:${i}">
      <span class="wb-row-head">
        <span class="wb-row-title">${esc(c.company)}</span>
        <span class="wb-row-period">${esc(c.period)}</span>
      </span>
      <span class="wb-row-meta wb-row-role">${esc(c.role)}</span>
      <span class="wb-row-desc">${esc(c.desc)}</span>
      <span class="wb-row-go">${esc(_('DETAIL.OPEN_DETAIL') || 'Open')} →</span>
    </button>
  `).join('')
}

function renderProjects() {
  const projects = _('PROJECTS')
  if (!Array.isArray(projects)) return '<div class="wb-text">No data</div>'
  // Rows were plain divs, so there was no way to reach a project's detail in
  // this mode at all. They open a detail window now.
  return projects.map(p => `
    <button type="button" class="wb-row" data-open="project:${esc(p.id)}">
      <span class="wb-row-title">${esc(p.name)}</span>
      <span class="wb-row-meta">${esc(p.stack || '')}</span>
      <span class="wb-row-desc">${esc(p.desc)}</span>
      <span class="wb-row-go">${esc(_('DETAIL.OPEN_DETAIL') || 'Open')} →</span>
    </button>
  `).join('')
}

function renderAchievements() {
  const achievements = _('ACHIEVEMENTS')
  if (!Array.isArray(achievements)) return '<div class="wb-text">No data</div>'
  return achievements.map((a, i) => `
    <button type="button" class="wb-row" data-open="achievement:${i}">
      <span class="wb-row-head">
        <span class="wb-row-title">${esc(a.title)}</span>
        <span class="wb-row-period">${esc(a.year)}</span>
      </span>
      <span class="wb-row-desc">${esc(a.desc)}</span>
      <span class="wb-row-go">${esc(_('DETAIL.OPEN_DETAIL') || 'Open')} →</span>
    </button>
  `).join('')
}

// ---------------------------------------------------------------------------
// Detail windows
//
// Opening a row spawns its own window rather than reusing #projectDetail, which
// this mode hides — a modal overlay would break the desktop metaphor and cover
// the taskbar the visitor uses to get back.
// ---------------------------------------------------------------------------

function detailLang() { return state?.lang || 'EN' }

function metricsBlock(highlights) {
  const scale = buildMetricScale(detailLang())
  return `<div class="wb-metrics pd-charts">${renderMetricGrid(highlights, scale, _('METRIC') || {})}</div>`
}

function renderProjectWindow(id) {
  const p = (_('PROJECTS') || []).find(x => x.id === id)
  const d = (PROJECTS_DETAIL[detailLang()] || PROJECTS_DETAIL.EN)[id]
  if (!p || !d) return `<div class="wb-text">${esc(_('DETAIL.NOT_FOUND') || 'not found')}</div>`
  return `
    <div class="wb-title">${esc(p.name)}</div>
    <div class="wb-sub">${esc(p.cat)} / ${esc(p.tag)}</div>
    <div class="wb-badge">🔒 ${esc(_('DETAIL.PRIVATE_REPO') || 'Private repository')}</div>
    <div class="wb-note">${esc(_('DETAIL.REFERENCE_NOTE') || '')}</div>
    <hr class="wb-divider">
    ${d.details.map(x => `<div class="wb-text">${esc(x)}</div>`).join('')}
    <div class="wb-section-title">${esc(_('DETAIL.KEY_METRICS') || 'Key Metrics')}</div>
    ${metricsBlock(d.highlights)}
    <div class="wb-section-title">${esc(_('DETAIL.FEATURES') || 'Features')}</div>
    ${d.features.map(f => `<div class="wb-bullet">· ${esc(f)}</div>`).join('')}
    <div class="wb-section-title">${esc(_('DETAIL.TECH_STACK') || 'Tech Stack')}</div>
    <div class="wb-text">${esc(p.stack)}</div>
  `
}

function renderCareerWindow(i) {
  const c = (_('CAREER') || [])[i]
  const d = (CAREER_DETAIL[detailLang()] || CAREER_DETAIL.EN)[i]
  if (!c || !d) return `<div class="wb-text">${esc(_('DETAIL.NOT_FOUND') || 'not found')}</div>`
  return `
    <div class="wb-title">${esc(c.role)}</div>
    <div class="wb-sub">${esc(c.company)} · ${esc(c.period)}</div>
    <hr class="wb-divider">
    ${d.details.map(x => `<div class="wb-text">${esc(x)}</div>`).join('')}
    <div class="wb-section-title">${esc(_('DETAIL.KEY_METRICS') || 'Key Metrics')}</div>
    ${metricsBlock(d.highlights)}
    <div class="wb-section-title">${esc(_('DETAIL.TECH_STACK') || 'Tech Stack')}</div>
    <div class="wb-tags">${d.techStack.map(t => `<span class="wb-tag">${esc(t)}</span>`).join('')}</div>
    <div class="wb-section-title">${esc(_('DETAIL.KEY_ACH') || 'Key Achievements')}</div>
    ${d.keyAchievements.map(a => `<div class="wb-bullet">▸ ${esc(a)}</div>`).join('')}
  `
}

function renderAchievementWindow(i) {
  const a = (_('ACHIEVEMENTS') || [])[i]
  const d = (ACHIEVEMENT_DETAIL[detailLang()] || ACHIEVEMENT_DETAIL.EN)[i]
  if (!a || !d) return `<div class="wb-text">${esc(_('DETAIL.NOT_FOUND') || 'not found')}</div>`
  return `
    <div class="wb-title">${esc(a.title)}</div>
    <div class="wb-sub">${esc(a.year)}</div>
    <hr class="wb-divider">
    ${d.details.map(x => `<div class="wb-text">${esc(x)}</div>`).join('')}
  `
}

function openDetail(token) {
  const [kind, ref] = String(token).split(':')
  if (kind === 'project') {
    const p = (_('PROJECTS') || []).find(x => x.id === ref)
    wm.open({ id: 'win-project-' + ref, title: p ? p.name : ref, icon: SVG.projects,
      content: renderProjectWindow(ref), width: 600, height: 460 })
  } else if (kind === 'career') {
    const c = (_('CAREER') || [])[Number(ref)]
    wm.open({ id: 'win-career-' + ref, title: c ? c.company : 'Career', icon: SVG.career,
      content: renderCareerWindow(Number(ref)), width: 600, height: 460 })
  } else if (kind === 'achievement') {
    const a = (_('ACHIEVEMENTS') || [])[Number(ref)]
    wm.open({ id: 'win-ach-' + ref, title: a ? a.title : 'Milestone', icon: SVG.achievements,
      content: renderAchievementWindow(Number(ref)), width: 540, height: 400 })
  }
  requestAnimationFrame(() => animateMetricGrid(document.getElementById('desktop-windows')))
}

function renderAura() {
  return `
    <div class="wb-title">Aura-Omnimesh</div>
    <div class="wb-section-title" style="color:#2ecc71">Coming Soon</div>
    <hr class="wb-divider">
    <div class="wb-text">Advanced monitoring mesh for distributed systems with real-time topology visualization, intelligent alerting, and predictive analytics.</div>
    <div class="wb-text" style="margin-top:8px;opacity:.5">Stack: Go, Rust, WebAssembly, D3.js, WebRTC</div>
  `
}

function renderMail() {
  return `
    <div class="wb-title">${_('FORM.SUBMIT')}</div>
    <hr class="wb-divider">
    <form class="terminal-form" data-form="consult" novalidate style="font-size:12px">
      <label style="display:block;margin-bottom:4px;opacity:.7">${_('FORM.NAME')}</label>
      <input type="text" name="name" placeholder="${_('FORM.PLACEHOLDER_NAME')}" autocomplete="name" style="width:100%;margin-bottom:10px;padding:6px 10px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:4px;color:inherit;font-family:inherit">
      <span data-field-error="name" style="font-size:10px;color:#e74c3c;opacity:0;transition:opacity .2s"></span>
      <label style="display:block;margin-bottom:4px;opacity:.7">${_('FORM.EMAIL')}</label>
      <input type="email" name="email" placeholder="${_('FORM.PLACEHOLDER_EMAIL')}" autocomplete="email" style="width:100%;margin-bottom:10px;padding:6px 10px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:4px;color:inherit;font-family:inherit">
      <span data-field-error="email" style="font-size:10px;color:#e74c3c;opacity:0;transition:opacity .2s"></span>
      <label style="display:block;margin-bottom:4px;opacity:.7">${_('FORM.MESSAGE')}</label>
      <textarea name="message" placeholder="${_('FORM.PLACEHOLDER_MSG')}" style="width:100%;margin-bottom:10px;padding:6px 10px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:4px;color:inherit;font-family:inherit;resize:vertical;min-height:60px"></textarea>
      <span data-field-error="message" style="font-size:10px;color:#e74c3c;opacity:0;transition:opacity .2s"></span>
      <div data-form-errors style="font-size:10px;color:#e74c3c;margin-bottom:8px"></div>
      <div data-form-success style="font-size:11px;color:#2ecc71;opacity:0;transition:opacity .3s"></div>
      <button type="submit" style="padding:6px 16px;background:var(--ubuntu-accent);border:none;border-radius:4px;color:#fff;font-family:inherit;font-size:12px;cursor:pointer">${_('FORM.SUBMIT')}</button>
    </form>
  `
}

function renderSettings() {
  const cur = getMode()
  return `
    <div class="wb-title">${_('SETTINGS') || 'Settings'}</div>
    <hr class="wb-divider">
    <div class="wb-section">
      <div class="wb-section-title">Mode</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${MODES.map(m => `
          <button class="stg-mode-btn" data-mode="${m}" style="padding:6px 14px;background:${cur === m ? 'var(--ubuntu-accent)' : 'rgba(255,255,255,.08)'};border:none;border-radius:4px;color:inherit;font-family:inherit;font-size:11px;cursor:pointer;transition:background .15s">${m.charAt(0).toUpperCase() + m.slice(1)}</button>
        `).join('')}
      </div>
    </div>
    <hr class="wb-divider">
    <div class="wb-section">
      <div class="wb-section-title">${_('SETTINGS_LANG') || 'Language'}</div>
      <div style="display:flex;gap:6px">
        <button class="stg-lang-btn" data-lang="EN" style="padding:6px 14px;background:rgba(255,255,255,.08);border:none;border-radius:4px;color:inherit;font-family:inherit;font-size:11px;cursor:pointer">EN</button>
        <button class="stg-lang-btn" data-lang="RU" style="padding:6px 14px;background:rgba(255,255,255,.08);border:none;border-radius:4px;color:inherit;font-family:inherit;font-size:11px;cursor:pointer">RU</button>
      </div>
    </div>
  `
}

let _inited = false

export function initDesktop(appState) {
  if (_inited) return
  _inited = true
  state = appState

  registerApp('about', _('ABOUT') || 'About', SVG.about, renderAbout)
  registerApp('career', _('CAREER_TITLE') || 'Career', SVG.career, renderCareer, { width: 600, height: 440 })
  registerApp('projects', _('PROJECTS_TITLE') || 'Projects', SVG.projects, renderProjects, { width: 640, height: 440 })
  registerApp('achievements', _('ACHIEVEMENTS_TITLE') || 'Achievements', SVG.achievements, renderAchievements, { width: 560, height: 400 })
  registerApp('aura', 'Aura-Omnimesh', SVG.aura, renderAura, { width: 480, height: 340 })
  registerApp('mail', _('MAIL') || 'Mail', SVG.mail, renderMail, { width: 460, height: 400 })
  registerApp('settings', _('SETTINGS') || 'Settings', SVG.settings, renderSettings, { width: 400, height: 300 })

  const iconsContainer = document.getElementById('desktop-icons')
  const startMenu = document.getElementById('start-menu')
  const winContainer = document.getElementById('desktop-windows')
  if (!iconsContainer || !winContainer) return

  wm = new WindowManager(winContainer)

  wm.onWindowChange(updateTaskbar)

  renderDesktopIcons(iconsContainer)
  renderStartMenu(startMenu)

  document.getElementById('start-btn')?.addEventListener('click', () => {
    startMenu?.classList.toggle('open')
  })

  // Row clicks inside any window open the corresponding detail window.
  winContainer.addEventListener('click', (e) => {
    const row = e.target.closest('[data-open]')
    if (row) openDetail(row.dataset.open)
  })

  document.getElementById('taskbar-windows')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.tb-window-btn')
    if (!btn) return
    const id = btn.dataset.win
    if (wm.isVisible(id)) wm.focus(id)
    else wm.restore(id)
  })

  // Desktop convention is double-click, but on a touch screen that is either
  // unreliable or gets eaten by the browser's double-tap zoom — which left the
  // icons completely dead on a phone.
  //
  // `pointer: coarse` alone is not enough: hybrid devices and some mobile
  // browsers report `fine`. Checked at event time rather than at init so a
  // resize or an orientation change is picked up.
  const icons = document.getElementById('desktop-icons')
  const tapToOpen = () =>
    window.matchMedia('(pointer: coarse)').matches ||
    window.innerWidth <= 768 ||
    navigator.maxTouchPoints > 0

  icons?.addEventListener('dblclick', (e) => {
    if (tapToOpen()) return // the click listener below already handled it
    const icon = e.target.closest('.desk-icon')
    if (icon) openApp(icon.dataset.app)
  })

  icons?.addEventListener('click', (e) => {
    if (!tapToOpen()) return
    const icon = e.target.closest('.desk-icon')
    if (icon) openApp(icon.dataset.app)
  })

  startMenu?.addEventListener('click', (e) => {
    const item = e.target.closest('.start-app-item')
    if (item) { openApp(item.dataset.app); startMenu.classList.remove('open') }
  })

  document.addEventListener('click', (e) => {
    if (startMenu && !e.target.closest('#start-btn') && !e.target.closest('#start-menu')) {
      startMenu.classList.remove('open')
    }
  })

  const shell = document.getElementById('desktop-shell')
  shell?.addEventListener('click', (e) => {
    if (e.target === shell || e.target === document.getElementById('desktop-wallpaper')) {
      wm.closeAll()
    }
  })

  document.addEventListener('click', (e) => {
    const modeBtn = e.target.closest('.stg-mode-btn')
    if (modeBtn) { setMode(modeBtn.dataset.mode); return }
    const langBtn = e.target.closest('.stg-lang-btn')
    if (langBtn && state) {
      const prev = state.lang
      state.lang = langBtn.dataset.lang
      if (prev !== state.lang) document.dispatchEvent(new CustomEvent('locale:change'))
    }
  })

  initClock()
  initModeSwitch()

  document.addEventListener('locale:change', () => {
    wm.closeAll()
    const icons = document.getElementById('desktop-icons')
    const sm = document.getElementById('start-menu')
    if (icons) renderDesktopIcons(icons)
    if (sm) renderStartMenu(sm)
  })

  document.addEventListener('mode:change', (e) => {
    if (e.detail.to === 'desktop') {
      wm.closeAll()
    }
  })
}
