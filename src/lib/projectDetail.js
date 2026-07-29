import PONYTAIL from '../config/ponytail.config.js';
import { PROJECTS_DETAIL, CAREER_DETAIL, ACHIEVEMENT_DETAIL } from '../data/projects.js';
import { snippetFor } from '../data/snippets.js';
import { buildMetricScale } from './stats.js';
import { renderMetricGrid, animateMetricGrid } from './statsUI.js';

const COLOR = {};
function _r() {
  const s = getComputedStyle(document.documentElement);
  const c = (v) => s.getPropertyValue(v).trim();
  const b = document.documentElement.getAttribute('data-mode') === 'business';
  COLOR.bg = c(b ? '--b-bg2' : '--bg2') || '#0d0d14';
  COLOR.surface = c(b ? '--b-bg3' : '--bg3') || '#12121c';
  COLOR.accent = c(b ? '--b-accent' : '--accent');
  // The accent carries the highlighted result line and the prompt marker, so
  // here it is text rather than a fill and needs the darker twin.
  COLOR.accentText = (b && c('--b-accent-text')) || COLOR.accent;
  // An undefined custom property resolves to '', and SVG treats an empty fill
  // as black — which is invisible on a dark surface and was how a missing
  // --b-accent2 went unnoticed in the light theme for so long.
  COLOR.accent2 = c(b ? '--b-accent2' : '--accent2') || COLOR.accent;
  COLOR.accent3 = c(b ? '--b-accent3' : '--accent3') || COLOR.accent;
  COLOR.text = c(b ? '--b-text' : '--text') || '#222';
  // Captions and code comments are content, not chrome. At 40% of the text
  // colour they landed near 2:1 — the same opacity-as-dimming pattern that made
  // the rest of the page unreadable. Business mode has a token sized for this;
  // the other modes get a mix heavy enough to stay legible on their grounds.
  COLOR.dim = (b && c('--b-text-mute')) || `color-mix(in srgb, ${COLOR.text} 72%, transparent)`;
  COLOR.border = c(b ? '--b-border' : '--border');
}
_r();

function l() { return PONYTAIL.LOCALE[PONYTAIL_LOCALE]; }
let PONYTAIL_LOCALE = 'EN';

// Portfolio-wide metric ranges, so an individual chart bar can be positioned
// against comparable numbers from every other project. Rebuilt on locale change
// because the highlight labels (and therefore some unit parsing) differ.
let METRIC_SCALE = buildMetricScale('EN');

export function setProjectLocale(locale) {
  if (locale !== PONYTAIL_LOCALE) METRIC_SCALE = buildMetricScale(locale);
  PONYTAIL_LOCALE = locale;
}

export function getProjectIds(projects, cat) {
  return projects
    .filter((p) => cat === l().CATEGORIES[0] || p.cat === cat)
    .map((p) => p.id);
}

export function renderProjectPage(projectId) {
  _r(); const projects = l().PROJECTS;
  const detail = PROJECTS_DETAIL[PONYTAIL_LOCALE]?.[projectId];
  const p = projects.find((pr) => pr.id === projectId);
  if (!p || !detail) { _renderNotFound(l().DETAIL.TYPE_PROJECT); return; }

  const cat = p.cat;
  const ids = getProjectIds(projects, cat);
  const idx = ids.indexOf(projectId);
  const prevId = idx > 0 ? ids[idx - 1] : null;
  const nextId = idx < ids.length - 1 ? ids[idx + 1] : null;

  const overlay = document.getElementById('projectDetail');
  const scrollContainer = document.querySelector('[data-scroll-container]');
  if (scrollContainer) scrollContainer.style.overflow = 'hidden';

  let navArrows = '';
  if (prevId || nextId) {
    navArrows = `<div class="pd-nav">
      ${prevId ? `<button class="pd-nav-btn" data-pd-nav="prev" data-pd-id="${prevId}">‹</button>` : '<div></div>'}
      <span class="pd-nav-counter">${idx + 1} / ${ids.length}</span>
      ${nextId ? `<button class="pd-nav-btn" data-pd-nav="next" data-pd-id="${nextId}">›</button>` : '<div></div>'}
    </div>`;
  }

  overlay.innerHTML = `
    <div class="pd-backdrop" data-pd-close></div>
    <div class="pd-panel">
      <div class="pd-header">
        <button class="pd-back" data-pd-close>← ${l().DETAIL.BACK}</button>
        ${navArrows}
      </div>

      <div class="pd-scroll">
        <div class="pd-hero">
          <span class="pd-tag">${p.tag} / ${p.cat}</span>
          <h1 class="pd-title">${p.name}</h1>
          <div class="pd-stack">${p.stack}</div>
          ${_renderLinks(detail.links, detail)}
        </div>

        <p class="pd-disclaimer">${l().DETAIL.REFERENCE_NOTE}</p>

        <div class="pd-screenshot">${_renderScreenshot(p)}</div>

        <div class="pd-details">
          ${detail.details.map((para) => `<p class="pd-para">${para}</p>`).join('')}
        </div>

        <div class="pd-metrics">
          <h3 class="pd-section-title">${l().DETAIL.KEY_METRICS}</h3>
          <div class="pd-charts" data-pd-charts>
            ${renderMetricGrid(detail.highlights, METRIC_SCALE, l().METRIC || {})}
          </div>
          <p class="pd-metrics-note">${(l().METRIC || {}).SCALE_NOTE || ''}</p>
        </div>

        <div class="pd-features">
          <h3 class="pd-section-title">${l().DETAIL.FEATURES}</h3>
          <div class="pd-features-grid">
            ${detail.features.map((f) => `<div class="pd-feature-item">${f}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('active');

  _wireProjectDetail(prevId, nextId);

  setTimeout(() => {
    overlay.querySelectorAll('[data-pd-animate]').forEach((el, i) => {
      setTimeout(() => el.classList.add('pd-visible'), 100 + i * 60);
    });
  }, 50);
}

function _renderLinks(links, detail) {
  const items = [];
  // Closed-source work gets a badge, not a dead link. A repository the reader
  // cannot open is better stated plainly than linked to a 404.
  if (detail?.access === 'private') {
    items.push(`<span class="pd-badge pd-badge-private">
      <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6">
        <rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>
      </svg>
      ${l().DETAIL.PRIVATE_REPO}
    </span>`);
  }
  if (links?.github) items.push(`<a href="${links.github}" target="_blank" rel="noopener" class="pd-link">GitHub ↗</a>`);
  if (links?.demo) items.push(`<a href="${links.demo}" target="_blank" rel="noopener" class="pd-link">Demo ↗</a>`);
  if (links?.docs) items.push(`<a href="${links.docs}" target="_blank" rel="noopener" class="pd-link">Docs ↗</a>`);
  return items.length ? `<div class="pd-links">${items.join('')}</div>` : '';
}


/**
 * Renders the project's own artefact.
 *
 * This used to be one of five generic SVG mockups picked by `screenshotType`,
 * shared across seventeen projects: ten showed the same terminal session down
 * to the same pod hash, the "code" mockup showed a Rust validator with a
 * Cargo.toml tree, and one leftover drew a blockchain. The dashboard carried
 * headline numbers — 99.99%, 50K/s, 12M+ — belonging to no project on the
 * site. Each project now supplies its own lines; see data/snippets.js.
 */
function _renderScreenshot(p) {
  const snip = snippetFor(p.id);
  if (!snip) return _svgPlaceholder(p.name);
  return _svgSnippet(p.name, snip);
}

// The snippets contain <, > and & (JSX, shell redirects, HTML types); SVG
// <text> is XML, so they have to be escaped or the document stops parsing.
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const LINE_H = 19;
const TOP = 62;

function _lineFill(kind) {
  switch (kind) {
    case 'c': return COLOR.dim;
    case 'p': return COLOR.accent2;
    case 'h': return COLOR.accentText;
    case 'k': return COLOR.text;
    default: return COLOR.text;
  }
}

function _svgSnippet(name, snip) {
  const isTerm = snip.kind === 'terminal';
  const rows = snip.lines.slice(0, 11);
  const height = TOP + rows.length * LINE_H + 30;

  const body = rows.map((ln, i) => {
    const y = TOP + i * LINE_H;
    const fill = _lineFill(ln.k);
    // A prompt line gets its marker drawn separately so the command itself
    // keeps its own colour and the two never run together visually.
    const lead = isTerm && ln.k === 'p'
      ? `<tspan fill="${COLOR.accentText}">$ </tspan>`
      : '';
    const main = `<tspan fill="${fill}">${esc(ln.t)}</tspan>`;
    const val = ln.v ? `<tspan fill="${COLOR.accent2}">${esc(ln.v)}</tspan>` : '';
    const bg = ln.k === 'h'
      ? `<rect x="14" y="${y - 13}" width="572" height="${LINE_H}" rx="3" fill="${COLOR.accent}" opacity=".08"/>`
      : '';
    return `${bg}<text x="20" y="${y}" font-size="11.5" font-family="monospace" xml:space="preserve">${lead}${main}${val}</text>`;
  }).join('');

  return `<svg class="pd-svg" viewBox="0 0 600 ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}: ${esc(snip.caption)}">
    <rect width="600" height="${height}" rx="8" fill="${COLOR.surface}"/>
    <rect x="0" y="0" width="600" height="34" rx="8" fill="${COLOR.bg}"/>
    <circle cx="16" cy="17" r="5" fill="#ff5f57"/><circle cx="30" cy="17" r="5" fill="#febc2e"/><circle cx="44" cy="17" r="5" fill="#28c840"/>
    <text x="300" y="22" text-anchor="middle" fill="${COLOR.dim}" font-size="10" font-family="monospace">${esc(snip.caption)}</text>
    ${body}
  </svg>`;
}

function _svgPlaceholder(name) {
  return `<svg class="pd-svg" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}">
    <rect width="600" height="120" rx="8" fill="${COLOR.surface}"/>
    <text x="300" y="64" text-anchor="middle" fill="${COLOR.dim}" font-size="11" font-family="monospace">${esc(name)}</text>
  </svg>`;
}


function _wireProjectDetail(prevId, nextId) {
  document.querySelectorAll('[data-pd-close]').forEach((el) => {
    el.removeEventListener('click', closeProjectDetail);
    el.addEventListener('click', closeProjectDetail);
  });
  document.removeEventListener('keydown', _pdKeyHandler);
  document.addEventListener('keydown', _pdKeyHandler);
  if (prevId) {
    const btn = document.querySelector('[data-pd-nav="prev"]');
    if (btn) btn.addEventListener('click', () => { renderProjectPage(prevId); });
  }
  if (nextId) {
    const btn = document.querySelector('[data-pd-nav="next"]');
    if (btn) btn.addEventListener('click', () => { renderProjectPage(nextId); });
  }

  const pd = document.getElementById('projectDetail');
  pd.dataset.pdPrev = prevId || '';
  pd.dataset.pdNext = nextId || '';

  requestAnimationFrame(() => {
    animateCharts();
  });
}

function _pdKeyHandler(e) {
  const pd = document.getElementById('projectDetail');
  if (e.key === 'Escape') closeProjectDetail();
  if (e.key === 'ArrowLeft' && pd?.dataset.pdPrev) renderProjectPage(pd.dataset.pdPrev);
  if (e.key === 'ArrowRight' && pd?.dataset.pdNext) renderProjectPage(pd.dataset.pdNext);
}

function closeProjectDetail() {
  const overlay = document.getElementById('projectDetail');
  overlay.classList.remove('active');
  overlay.innerHTML = '';
  document.removeEventListener('keydown', _pdKeyHandler);
  const scrollContainer = document.querySelector('[data-scroll-container]');
  if (scrollContainer) scrollContainer.style.overflow = '';
  // Only clear the hash when it is one of our detail routes. Stripping it
  // unconditionally desynchronised the router's lastHash from the real URL:
  // after landing on an unknown route the 404 stayed up because navigating
  // "home" produced no hashchange to react to.
  if (/^#\/(project|career|achievement)\//.test(window.location.hash)) {
    history.replaceState(null, '', window.location.pathname);
  }
}

export { closeProjectDetail };

export function animateCharts() {
  animateMetricGrid(document.getElementById('projectDetail') || document);
}

export function renderCareerPage(idx) {
  _r(); const careers = l().CAREER;
  const detail = CAREER_DETAIL[PONYTAIL_LOCALE]?.[idx];
  const c = careers[idx];
  if (!c || !detail) { _renderNotFound(l().DETAIL.TYPE_CAREER); return; }

  const wrap = document.getElementById('projectDetail');
  const scrollContainer = document.querySelector('[data-scroll-container]');
  if (scrollContainer) scrollContainer.style.overflow = 'hidden';

  wrap.innerHTML = `
    <div class="pd-backdrop" data-pd-close></div>
    <div class="pd-panel">
      <div class="pd-header">
        <button class="pd-back" data-pd-close>← ${l().DETAIL.BACK_CAREER}</button>
      </div>
      <div class="pd-scroll">
        <div class="pd-hero">
          <span class="pd-tag">${c.period}</span>
          <h1 class="pd-title">${c.role} <span style="color:${COLOR.accent2}">@ ${c.company}</span></h1>
        </div>

        <div class="pd-details">
          ${detail.details.map((para) => `<p class="pd-para">${para}</p>`).join('')}
        </div>

        <div class="pd-metrics">
          <h3 class="pd-section-title">${l().DETAIL.KEY_METRICS}</h3>
          <div class="pd-charts" data-pd-charts>
            ${renderMetricGrid(detail.highlights, METRIC_SCALE, l().METRIC || {})}
          </div>
        </div>

        <div style="margin-bottom:24px">
          <h3 class="pd-section-title">${l().DETAIL.TECH_STACK}</h3>
          <div class="pd-stack-tags">${detail.techStack.map((t) => `<span class="pd-stack-tag">${t}</span>`).join('')}</div>
        </div>

        <div class="pd-features">
          <h3 class="pd-section-title">${l().DETAIL.KEY_ACH}</h3>
          <div class="pd-ach-list">${detail.keyAchievements.map((a) => `<div class="pd-ach-item">▸ ${a}</div>`).join('')}</div>
        </div>
      </div>
    </div>`;

  wrap.classList.add('active');
  _wireGenericDetail();
  requestAnimationFrame(() => {
    animateCharts();
    setTimeout(() => {
      wrap.querySelectorAll('[data-pd-animate]').forEach((el, i) => {
        setTimeout(() => el.classList.add('pd-visible'), 100 + i * 60);
      });
    }, 50);
  });
}


export function renderAchievementPage(idx) {
  _r(); const achievements = l().ACHIEVEMENTS;
  const detail = ACHIEVEMENT_DETAIL[PONYTAIL_LOCALE]?.[idx];
  const a = achievements[idx];
  if (!a || !detail) { _renderNotFound(l().DETAIL.TYPE_ACH); return; }

  const wrap = document.getElementById('projectDetail');
  const scrollContainer = document.querySelector('[data-scroll-container]');
  if (scrollContainer) scrollContainer.style.overflow = 'hidden';

  const links = Object.entries(detail.links || {});
  const linksHtml = links.length ? `<div class="pd-links" style="margin-top:16px">${links.map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener" class="pd-link">${k} ↗</a>`).join('')}</div>` : '';

  wrap.innerHTML = `
    <div class="pd-backdrop" data-pd-close></div>
    <div class="pd-panel">
      <div class="pd-header">
        <button class="pd-back" data-pd-close>← ${l().DETAIL.BACK_ACH}</button>
      </div>
      <div class="pd-scroll">
        <div class="pd-hero">
          <span class="pd-tag">${a.year}</span>
          <h1 class="pd-title">${a.title}</h1>
        </div>
        <div class="pd-details">
          ${detail.details.map((para) => `<p class="pd-para">${para}</p>`).join('')}
          ${linksHtml}
        </div>
      </div>
    </div>`;

  wrap.classList.add('active');
  _wireGenericDetail();
}

function _renderNotFound(type) {
  const wrap = document.getElementById('projectDetail');
  wrap.innerHTML = `<div class="pd-backdrop" data-pd-close></div>
    <div class="pd-panel"><div class="pd-header"><button class="pd-back" data-pd-close>← ${l().DETAIL.BACK}</button></div>
    <div class="pd-scroll" style="text-align:center;padding-top:120px;color:${COLOR.dim};font-family:monospace"><h2>${type} ${l().DETAIL.NOT_FOUND}</h2></div></div>`;
  wrap.classList.add('active');
}

function _wireGenericDetail() {
  document.querySelectorAll('[data-pd-close]').forEach((el) => {
    el.removeEventListener('click', closeProjectDetail);
    el.addEventListener('click', closeProjectDetail);
  });
  document.removeEventListener('keydown', _pdKeyHandler);
  document.addEventListener('keydown', _pdKeyHandler);
  // Career and achievement pages have no prev/next. Without clearing these,
  // ←/→ still navigated to whichever project was opened before, jumping the
  // reader out of the page they are on.
  const pd = document.getElementById('projectDetail');
  if (pd) { pd.dataset.pdPrev = ''; pd.dataset.pdNext = ''; }
  const scrollContainer = document.querySelector('[data-scroll-container]');
  if (scrollContainer) scrollContainer.style.overflow = 'hidden';
}
