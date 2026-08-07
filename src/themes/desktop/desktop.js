import PONYTAIL from '../../config/ponytail.config.js'
import { getMode, setMode, MODES } from '../themeManager.js'
import { computeStats, buildMetricScale } from '../../lib/stats.js'
import { PROJECTS_DETAIL, CAREER_DETAIL, ACHIEVEMENT_DETAIL } from '../../data/projects.js'
import { renderStatsForDesktop, renderMetricGrid, animateMetricGrid, renderCaseMetrics, animateCaseMetrics, esc } from '../../lib/statsUI.js'
import { webProjects, webProjectCount } from '../../data/webProjects.js'
import { PROCESS, CONTACTS, LEGAL, DONATION, hoursLine } from '../../data/process.js'
import { stackGroups, stackToolCount } from '../../data/stack.js'
import { wireCopyButtons } from '../../lib/copy.js'
import { PRIVACY } from '../../data/privacy.js'
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
  mail: '<svg viewBox="0 0 48 48" fill="none" stroke="#e95420" stroke-width="1.5" width="28" height="28"><rect x="4" y="8" width="40" height="32" rx="4"/><path d="M4 12l20 16 20-16"/></svg>',
  settings: '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="1.5" width="28" height="28"><circle cx="24" cy="24" r="6"/><path d="M24 2v6m0 32v6M2 24h6m32 0h6M8.5 8.5l4.2 4.2m22.6 22.6l4.2 4.2M8.5 39.5l4.2-4.2m22.6-22.6l4.2-4.2" stroke-linecap="round"/></svg>',
  tools: '<svg viewBox="0 0 48 48" fill="none" stroke="#888" stroke-width="1.5" width="28" height="28"><path d="M30 6a9 9 0 0 0-9 9c0 1.4.3 2.7.9 3.9L6 34.8V42h7.2l15.9-15.9c1.2.6 2.5.9 3.9.9a9 9 0 0 0 0-18z" stroke-linejoin="round"/></svg>',
  coffee: '<svg viewBox="0 0 48 48" fill="none" stroke="#fbbb2d" stroke-width="1.5" width="28" height="28"><path d="M8 18h26v14a10 10 0 0 1-10 10h-6a10 10 0 0 1-10-10z"/><path d="M34 22h4a5 5 0 0 1 0 10h-4"/><path d="M16 6v5m8-5v5" stroke-linecap="round"/></svg>',
}

function registerApp(id, label, svg, contentFn, opts = {}) {
  apps.push({ id, label, svg, contentFn, ...opts })
}

// `label` is a function so it is resolved at render time, not at registration.
// As a plain string it froze the language the app happened to boot in.
function appLabel(a) {
  return typeof a.label === 'function' ? a.label() : a.label
}

// Buttons, not divs: as <div> these were unreachable without a mouse, which
// made an entire mode keyboard-inaccessible.
function renderDesktopIcons(container) {
  container.innerHTML = apps.map(a => `
    <button type="button" class="desk-icon" data-app="${a.id}">
      ${appIcon(a.svg)}
      <span class="desk-icon-label">${appLabel(a)}</span>
    </button>
  `).join('')
}

function renderStartMenu(container) {
  container.innerHTML = apps.map(a => `
    <button type="button" class="start-app-item" data-app="${a.id}">
      <span class="sai-icon">${a.svg}</span>
      ${appLabel(a)}
    </button>
  `).join('')
}

function openApp(id) {
  const app = apps.find(a => a.id === id)
  if (!app) return
  // Settings is not a window. Every mode shares one panel — the same one the
  // tray gear opens — so the desktop app hands off to it rather than drawing a
  // second, different version of the same controls.
  if (app.panel) { app.panel(); return }
  wm.open({ id: 'win-' + id, title: appLabel(app), icon: app.svg, content: app.contentFn(), width: app.width || 520, height: app.height || 380 })
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

function renderProcess() {
  const lang = state?.lang || 'EN'
  const rows = PROCESS.map(s => `
    <div class="wb-text">
      <b>${esc(s.n)} · ${esc(s.title[lang] || s.title.EN)}</b><br>
      ${esc(s.body[lang] || s.body.EN)}
    </div>`).join('')
  return `<div class="wb-doc">${rows}</div>`
}

/**
 * The policy as a window. Same source as the page and the terminal output —
 * a document that said something different depending on which interface opened
 * it would be worse than not having one.
 */
function renderLegal() {
  const lang = state?.lang || 'EN'
  const doc = PRIVACY[lang] || PRIVACY.EN
  const pick = (o) => esc(o?.[lang] || o?.EN || '')
  const body = doc.sections.map(s => `
    <div class="wb-text">
      <b>${esc(s.h)}</b><br>
      ${(s.p || []).map(esc).join('<br>')}
      ${(s.list || []).length ? '<br>' + s.list.map(li => '· ' + esc(li)).join('<br>') : ''}
      ${(s.after || []).length ? '<br>' + s.after.map(esc).join('<br>') : ''}
    </div>`).join('')
  return `
    <div class="wb-doc">
      <div class="wb-title">${esc(doc.title)}</div>
      <div class="wb-text">${esc(doc.updated)}</div>
      <hr class="wb-divider">
      <div class="wb-text">${pick(LEGAL.basis)}. ${pick(LEGAL.details)}.</div>
      <hr class="wb-divider">
      ${body}
    </div>`
}

function renderWebProjects() {
  const items = webProjects(state?.lang || 'EN')
  if (!items.length) return '<div class="wb-text">—</div>'
  return items.map(p => `
    <button type="button" class="wb-row" data-open="case:${esc(p.id)}">
      <span class="wb-row-title">${esc(p.name)}</span>
      <span class="wb-row-meta">${esc([p.period, p.capacity].filter(Boolean).join(' · '))}</span>
      <span class="wb-row-desc">${esc(p.outcome || p.sector)}</span>
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

/**
 * A case as a document rather than a dashboard — this mode's metaphor is a
 * file, and the four beats read as a memo about a job.
 */
function renderCaseWindow(id) {
  const c = webProjects(state?.lang || 'EN').find(x => x.id === id)
  if (!c) return '<div class="wb-text">—</div>'
  const L = _('WEB_LABELS') || {}
  // Reusing .wb-text rather than inventing a class: an unstyled wrapper is how
  // "Period" and its value ended up printed as one word.
  const field = (k, v) => (v ? `<div class="wb-text"><b>${esc(k)}:</b> ${esc(v)}</div>` : '')
  const beat = (k, v) => (v ? `<div class="wb-text"><b>${esc(k)}</b><br>${esc(v)}</div>` : '')
  const list = (k, items) => (items?.length
    ? `<div class="wb-text"><b>${esc(k)}</b><ul class="pd-scope">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`
    : '')
  return `
    <div class="wb-doc">
      ${field(L.PERIOD, c.period)}
      ${field(L.ROLE, c.capacity)}
      ${field(L.STACK, (c.stack || []).join(', '))}
      ${c.named ? '' : `<div class="wb-text">${esc(L.UNNAMED || '')}</div>`}
      ${beat(L.SITUATION, c.situation)}
      ${beat(L.WORK, c.work)}
      ${list(L.SCOPE, c.scope)}
      ${c.metrics?.length ? `<div class="wb-text"><b>${esc(L.RESULTS || '')}</b></div>
      <div class="cm-grid">${renderCaseMetrics(c.metrics, L)}</div>` : ''}
      ${beat(L.OUTCOME, c.outcome)}
      ${list(L.COMPLEXITY, c.complexity)}
      ${beat(L.EVIDENCE, c.evidence)}
    </div>`
}

function openDetail(token) {
  const [kind, ref] = String(token).split(':')
  if (kind === 'case') {
    const c = webProjects(state?.lang || 'EN').find(x => x.id === ref)
    wm.open({ id: 'win-case-' + ref, title: c ? c.name : ref, icon: SVG.projects,
      content: renderCaseWindow(ref), width: 620, height: 500 })
    requestAnimationFrame(() => animateCaseMetrics(document.getElementById('win-case-' + ref)))
  } else if (kind === 'project') {
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
      <label class="consent-row" style="font-size:11px">
        <input type="checkbox" name="consent" value="on">
        <span>${_('FORM.CONSENT')}
          <a href="#" data-privacy-link data-open-legal>${_('FORM.CONSENT_LINK')}</a></span>
      </label>
      <span data-field-error="consent" style="font-size:10px;color:#e74c3c;opacity:0;transition:opacity .2s"></span>
      <div data-form-errors style="font-size:10px;color:#e74c3c;margin-bottom:8px"></div>
      <div data-form-success style="font-size:11px;color:#2ecc71;opacity:0;transition:opacity .3s"></div>
      <button type="submit" style="padding:6px 16px;background:var(--ubuntu-accent);border:none;border-radius:4px;color:#fff;font-family:inherit;font-size:12px;cursor:pointer">${_('FORM.SUBMIT')}</button>
    </form>
    <hr class="wb-divider">
    <div class="wb-text" style="font-size:11px">
      <b>${esc(_('FOOTER.WRITE') || 'Write to me')}:</b>
      <a href="mailto:${esc(CONTACTS.email)}">${esc(CONTACTS.email)}</a> ·
      <a href="${esc(CONTACTS.telegramUrl)}" target="_blank" rel="noopener">${esc(CONTACTS.telegram)}</a><br>
      ${esc(_('FOOTER.HOURS') || 'Working hours')}: ${esc(hoursLine(state?.lang || 'EN'))}
    </div>
  `
}

/**
 * The toolbox as a window, one area per row.
 *
 * Kept out of the About window's statistics on purpose: those count what the
 * described work used, and this is what the owner can pick up. Two claims of
 * different kinds, in two places, each labelled as what it is.
 */
function renderTools() {
  const lang = state?.lang || 'EN'
  const groups = stackGroups(lang)
  const t = PONYTAIL.LOCALE[lang]?.SECTION_TITLES || {}
  return `
    <div class="wb-title">${esc(t.STACK || 'Toolbox')}</div>
    <div class="wb-sub">${esc((t.STACK_SUB || '').replace('{n}', stackToolCount()))}</div>
    <hr class="wb-divider">
    ${groups.map(g => `
      <div class="wb-section">
        <div class="wb-section-title">${esc(g.title)}</div>
        ${g.note ? `<div class="wb-note">${esc(g.note)}</div>` : ''}
        ${g.lines.map(l => `
          <div class="wb-bullet"><b>${esc(l.label)}:</b> ${esc(l.items.join(', '))}</div>`).join('')}
      </div>`).join('')}
  `
}

/**
 * The same offer the terminal's `coffee` command prints, in a window.
 *
 * The address is never typed here — it comes from DONATION, so all three modes
 * quote one wallet. The copy button matters more than it looks: a TRC-20
 * address is 34 characters that nobody transcribes correctly from a phone.
 */
function renderCoffee() {
  const c = PONYTAIL.LOCALE[state?.lang || 'EN']?.COFFEE || {}
  return `
    <div class="wb-title">${esc(coffeeTitle(c))}</div>
    <hr class="wb-divider">
    <div class="wb-section">
      <div class="wb-section-title">${esc(c.NETWORK || DONATION.network)}</div>
      <code class="wb-addr">${esc(DONATION.address)}</code>
      <button type="button" class="wb-copy" data-copy="${esc(DONATION.address)}"
        data-copy-done="${esc(c.DONE || '✓ Copied')}">${esc(c.COPY || 'Copy Address')}</button>
    </div>
  `
}

// The locale prefixes the title with a cup. Beside an icon that is already a
// cup it reads as a stutter, so the emoji is dropped wherever the icon is shown
// — the same trim the terminal does for its heading.
function coffeeTitle(c) {
  return (c.TITLE || 'Buy me a coffee').replace(/^[^\p{L}]+/u, '')
}

// The heading read "Mode" and the buttons capitalised the raw mode id, so the
// desktop settings window stayed in English however the site was set.
function modeLabel(mode) {
  return _(`MODE_${mode.toUpperCase()}`) || mode.charAt(0).toUpperCase() + mode.slice(1)
}

function renderSettings() {
  const cur = getMode()
  return `
    <div class="wb-title">${_('SETTINGS') || 'Settings'}</div>
    <hr class="wb-divider">
    <div class="wb-section">
      <div class="wb-section-title">${_('SETTINGS_INTERFACE') || 'Interface'}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${MODES.map(m => `
          <button class="stg-mode-btn" data-mode="${m}" style="padding:6px 14px;background:${cur === m ? 'var(--ubuntu-accent)' : 'rgba(255,255,255,.08)'};border:none;border-radius:4px;color:inherit;font-family:inherit;font-size:11px;cursor:pointer;transition:background .15s">${modeLabel(m)}</button>
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

  registerApp('about', () => _('ABOUT') || 'About', SVG.about, renderAbout)
  registerApp('career', () => _('CAREER_TITLE') || 'Career', SVG.career, renderCareer, { width: 600, height: 440 })
  registerApp('projects', () => _('PROJECTS_TITLE') || 'Projects', SVG.projects, renderProjects, { width: 640, height: 440 })
  registerApp('achievements', () => _('ACHIEVEMENTS_TITLE') || 'Achievements', SVG.achievements, renderAchievements, { width: 560, height: 400 })
  // Client work gets its own folder rather than joining the Projects window:
  // one holds jobs done for other companies, the other holds an approach. The
  // icon only exists when there is something inside it — an empty folder on a
  // desktop is a promise the site cannot keep.
  if (webProjectCount() > 0) {
    registerApp('webprojects', () => _('SECTION_TITLES.WEB') || 'Client Projects', SVG.projects,
      renderWebProjects, { width: 640, height: 440 })
  }
  registerApp('process', () => _('SECTION_TITLES.PROCESS') || 'How I Work', SVG.about,
    renderProcess, { width: 600, height: 460 })
  registerApp('mail', () => _('MAIL') || 'Mail', SVG.mail, renderMail, { width: 460, height: 440 })
  registerApp('legal', () => _('FOOTER.PRIVACY') || 'Privacy', SVG.about,
    renderLegal, { width: 620, height: 480 })
  // The terminal's `coffee` command had no equivalent here or in business, so
  // two interfaces out of three simply did not carry the offer.
  registerApp('tools', () => PONYTAIL.LOCALE[state?.lang || 'EN']?.SECTION_TITLES?.STACK || 'Toolbox',
    SVG.tools, renderTools, { width: 620, height: 460 })
  registerApp('coffee', () => coffeeTitle(PONYTAIL.LOCALE[state?.lang || 'EN']?.COFFEE || {}), SVG.coffee,
    renderCoffee, { width: 420, height: 260 })
  registerApp('settings', () => _('SETTINGS') || 'Settings', SVG.settings, renderSettings, {
    panel: () => document.querySelector('.settings-gear')?.click(),
  })

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
  //
  // A pointer tap is handled separately from click. These rows sit inside a
  // scrollable window body, and iOS discards the synthesised click as soon as
  // the finger drifts a few pixels — it decides the gesture was a scroll. On a
  // phone that reads as a row that simply does not open, intermittently, which
  // is impossible to reproduce with a synthetic tap because a synthetic tap
  // never moves. Tracking the pointer ourselves keeps a short, still press
  // working while a real scroll still scrolls.
  let tap = null
  let tapHandledAt = 0

  wireCopyButtons(winContainer)

  winContainer.addEventListener('pointerdown', (e) => {
    const row = e.target.closest('[data-open]')
    tap = row ? { row, x: e.clientX, y: e.clientY, at: Date.now() } : null
  })

  winContainer.addEventListener('pointercancel', () => { tap = null })

  winContainer.addEventListener('pointerup', (e) => {
    const started = tap
    tap = null
    if (!started || e.pointerType === 'mouse') return   // the mouse has click
    if (Date.now() - started.at > 600) return           // a long press is not a tap
    if (Math.hypot(e.clientX - started.x, e.clientY - started.y) > 12) return // a scroll
    if (e.target.closest('[data-open]') !== started.row) return // finished elsewhere
    tapHandledAt = Date.now()
    openDetail(started.row.dataset.open)
  })

  // The policy link inside the Mail window opens the Legal window rather than
  // navigating away: leaving the desktop to read a policy and having to find
  // your way back is not what this mode promises.
  winContainer.addEventListener('click', (e) => {
    const legal = e.target.closest('[data-open-legal]')
    if (!legal) return
    e.preventDefault()
    openApp('legal')
  })

  winContainer.addEventListener('click', (e) => {
    // A click may still follow the tap above; opening the same detail twice
    // would stack an identical window on itself.
    if (Date.now() - tapHandledAt < 700) return
    if (e.target.closest('[data-open-legal]')) return
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

  // A focused icon opens on Enter or Space. Pointer users get double-click on
  // a desktop and single tap on a touch screen; neither helps a keyboard.
  icons?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const icon = e.target.closest('.desk-icon')
    if (!icon) return
    e.preventDefault()
    openApp(icon.dataset.app)
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

  // Rotating a phone or resizing the browser shrinks the work area under any
  // window already placed in it, which would otherwise leave one stranded
  // off-screen with its title bar out of reach.
  let reflowTimer = null
  window.addEventListener('resize', () => {
    clearTimeout(reflowTimer)
    reflowTimer = setTimeout(() => wm.reflow(), 120)
  })

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
