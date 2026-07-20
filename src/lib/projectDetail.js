import PONYTAIL from '../config/ponytail.config.js';
import { PROJECTS_DETAIL, CAREER_DETAIL, ACHIEVEMENT_DETAIL } from '../data/projects.js';

const COLOR = {};
function _r() {
  const s = getComputedStyle(document.documentElement);
  const c = (v) => s.getPropertyValue(v).trim();
  COLOR.bg = c('--bg2') || '#0d0d14'; COLOR.surface = c('--bg3') || '#12121c';
  COLOR.accent = c('--accent'); COLOR.accent2 = c('--accent2'); COLOR.accent3 = c('--accent3');
  COLOR.text = c('--text'); COLOR.dim = `color-mix(in srgb, ${c('--text')} 40%, transparent)`;
  COLOR.border = c('--border');
}
_r();

function l() { return PONYTAIL.LOCALE[PONYTAIL_LOCALE]; }
let PONYTAIL_LOCALE = 'EN';

export function setProjectLocale(locale) {
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
          ${_renderLinks(detail.links)}
        </div>

        <div class="pd-screenshot">${_renderScreenshot(p, detail)}</div>

        <div class="pd-details">
          ${detail.details.map((para) => `<p class="pd-para">${para}</p>`).join('')}
        </div>

        <div class="pd-metrics">
          <h3 class="pd-section-title">${l().DETAIL.KEY_METRICS}</h3>
          <div class="pd-charts" data-pd-charts>
            ${detail.highlights.map((h, i) => _renderChartItem(h, i)).join('')}
          </div>
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

function _renderLinks(links) {
  const items = [];
  if (links.github) items.push(`<a href="${links.github}" target="_blank" rel="noopener" class="pd-link">GitHub ↗</a>`);
  if (links.demo) items.push(`<a href="${links.demo}" target="_blank" rel="noopener" class="pd-link">Demo ↗</a>`);
  if (links.docs) items.push(`<a href="${links.docs}" target="_blank" rel="noopener" class="pd-link">Docs ↗</a>`);
  return items.length ? `<div class="pd-links">${items.join('')}</div>` : '';
}

function _renderChartItem(h, i) {
  const pct = typeof h.value === 'number' ? Math.min(Math.round(h.value), 100) : 80;
  const isBool = h.value === true;
  const displayVal = isBool ? '✓' : (typeof h.value === 'number' ? (h.unit ? `${h.value}${h.unit}` : `${h.value}`) : h.value);

  if (isBool) {
    return `<div class="pd-chart-item" data-pd-animate>
      <div class="pd-chart-label">${h.label}</div>
      <div class="pd-chart-bool">
        <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="${COLOR.border}" stroke-width="3"/><circle cx="20" cy="20" r="16" fill="none" stroke="${COLOR.accent2}" stroke-width="3" stroke-dasharray="100.5" stroke-dashoffset="0" opacity="0"/><path d="M12 20l6 6 10-10" fill="none" stroke="${COLOR.accent2}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0"/></svg>
      </div>
    </div>`;
  }

  const isLarge = h.label.length > 15;

  return `<div class="pd-chart-item ${isLarge ? 'pd-chart-wide' : ''}" data-pd-animate>
    <div class="pd-chart-label">${h.label}</div>
    <div class="pd-chart-bar-wrap">
      <div class="pd-chart-bar-fill" style="width:0%" data-pd-bar="${pct}"></div>
    </div>
    <div class="pd-chart-val" data-pd-count="${typeof h.value === 'number' ? h.value : 0}">${displayVal}</div>
  </div>`;
}

function _renderScreenshot(p, detail) {
  const type = detail.screenshotType || 'dashboard';
  const name = p.name;

  switch (type) {
    case 'terminal': return _svgTerminal(name);
    case 'graph': return _svgGraph(name);
    case 'code': return _svgCodeEditor(name);
    case 'blocks': return _svgBlocks(name);
    default: return _svgDashboard(name);
  }
}

function _svgDashboard(name) {
  return `<svg class="pd-svg" viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="340" rx="8" fill="${COLOR.surface}"/>
    <rect x="0" y="0" width="600" height="32" rx="8" fill="${COLOR.bg}"/>
    <circle cx="16" cy="16" r="5" fill="#ff5f57"/><circle cx="30" cy="16" r="5" fill="#febc2e"/><circle cx="44" cy="16" r="5" fill="#28c840"/>
    <text x="300" y="21" text-anchor="middle" fill="${COLOR.dim}" font-size="10" font-family="monospace">${name} — Dashboard</text>
    <rect x="12" y="44" width="140" height="80" rx="4" fill="${COLOR.bg}" stroke="${COLOR.border}" stroke-width=".5"/>
    <text x="24" y="62" fill="${COLOR.dim}" font-size="8" font-family="monospace">METRIC A</text>
    <text x="24" y="84" fill="${COLOR.accent}" font-size="18" font-family="monospace" font-weight="bold">99.99%</text>
    <rect x="12" y="130" width="140" height="80" rx="4" fill="${COLOR.bg}" stroke="${COLOR.border}" stroke-width=".5"/>
    <text x="24" y="148" fill="${COLOR.dim}" font-size="8" font-family="monospace">METRIC B</text>
    <text x="24" y="170" fill="${COLOR.accent2}" font-size="18" font-family="monospace" font-weight="bold">50K/s</text>
    <rect x="12" y="216" width="140" height="80" rx="4" fill="${COLOR.bg}" stroke="${COLOR.border}" stroke-width=".5"/>
    <text x="24" y="234" fill="${COLOR.dim}" font-size="8" font-family="monospace">METRIC C</text>
    <text x="24" y="256" fill="${COLOR.accent}" font-size="18" font-family="monospace" font-weight="bold">12M+</text>
    <rect x="164" y="44" width="424" height="140" rx="4" fill="${COLOR.bg}" stroke="${COLOR.border}" stroke-width=".5"/>
    <text x="176" y="62" fill="${COLOR.dim}" font-size="8" font-family="monospace">PERFORMANCE OVER TIME</text>
    <polyline points="200,170 260,150 320,120 380,130 440,80 500,95 560,70" fill="none" stroke="${COLOR.accent}" stroke-width="1.5" opacity=".8"/>
    <polyline points="200,170 260,155 320,140 380,145 440,120 500,130 560,105" fill="none" stroke="${COLOR.accent2}" stroke-width="1" opacity=".4"/>
    <circle cx="440" cy="80" r="3" fill="${COLOR.accent}"/>
    <rect x="164" y="192" width="424" height="104" rx="4" fill="${COLOR.bg}" stroke="${COLOR.border}" stroke-width=".5"/>
    <text x="176" y="210" fill="${COLOR.dim}" font-size="8" font-family="monospace">RECENT ACTIVITY</text>
    ${[0,1,2,3,4].map((i) => `<rect x="${180 + i * 82}" y="${240 - Math.random() * 30}" width="16" height="${30 + Math.random() * 30}" rx="2" fill="${COLOR.accent}" opacity=".${4 + i * 1}"/>`).join('')}
    <rect x="164" y="304" width="200" height="24" rx="4" fill="rgba(0,212,255,.08)"/>
    <text x="180" y="319" fill="${COLOR.accent}" font-size="10" font-family="monospace" font-weight="bold">System Healthy ▸</text>
  </svg>`;
}

function _svgTerminal(name) {
  return `<svg class="pd-svg" viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="340" rx="8" fill="${COLOR.surface}"/>
    <rect x="0" y="0" width="600" height="32" rx="8" fill="#0a0a10"/>
    <circle cx="16" cy="16" r="5" fill="#ff5f57"/><circle cx="30" cy="16" r="5" fill="#febc2e"/><circle cx="44" cy="16" r="5" fill="#28c840"/>
    <text x="300" y="21" text-anchor="middle" fill="${COLOR.dim}" font-size="10" font-family="monospace">${name} — Terminal</text>
    <text x="20" y="56" fill="${COLOR.accent2}" font-size="11" font-family="monospace">$ kubectl debug pod/app-7f8b9c --ephemeral</text>
    <text x="20" y="76" fill="${COLOR.text}" font-size="11" font-family="monospace" opacity=".7">Created debug container: debug-8a2f</text>
    <text x="20" y="96" fill="${COLOR.text}" font-size="11" font-family="monospace" opacity=".7">Container app running: 3h 12m</text>
    <text x="20" y="116" fill="${COLOR.text}" font-size="11" font-family="monospace" opacity=".7">Memory: 256Mi / 512Mi &lt;—————————▷ 50%</text>
    <rect x="20" y="130" width="560" height="1" fill="${COLOR.border}" opacity=".3"/>
    <text x="20" y="150" fill="${COLOR.accent2}" font-size="11" font-family="monospace">$ curl http://localhost:8080/health</text>
    <text x="20" y="170" fill="${COLOR.accent}" font-size="11" font-family="monospace">{"status":"ok","uptime":"3d12h","replicas":6,"region":"eu-west-1"}</text>
    <text x="20" y="190" fill="${COLOR.accent2}" font-size="11" font-family="monospace">$ kubectl logs -f app-7f8b9c --tail=20</text>
    <text x="20" y="210" fill="${COLOR.dim}" font-size="10" font-family="monospace">[INFO] 2026-07-17T12:00:01Z Request processed: 2.3ms</text>
    <text x="20" y="226" fill="${COLOR.dim}" font-size="10" font-family="monospace">[INFO] 2026-07-17T12:00:01Z Cache hit: session_9a2f7b</text>
    <text x="20" y="242" fill="${COLOR.dim}" font-size="10" font-family="monospace">[INFO] 2026-07-17T12:00:02Z DB query: 4 rows in 1.1ms</text>
    <text x="20" y="258" fill="${COLOR.accent2}" font-size="11" font-family="monospace">$ kubectl get pods -n production -w</text>
    <rect x="20" y="272" width="560" height="24" rx="4" fill="rgba(0,255,136,.06)"/>
    <text x="30" y="288" fill="${COLOR.accent2}" font-size="10" font-family="monospace">app-7f8b9c  Running   6/6   Ready   age:3d12h  ✓</text>
    <text x="20" y="316" fill="${COLOR.dim}" font-size="10" font-family="monospace">Type 'help' for available commands    █</text>
  </svg>`;
}

function _svgGraph(name) {
  const r = () => 30 + Math.random() * 50;
  return `<svg class="pd-svg" viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="340" rx="8" fill="${COLOR.surface}"/>
    <rect x="0" y="0" width="600" height="32" rx="8" fill="${COLOR.bg}"/>
    <circle cx="16" cy="16" r="5" fill="#ff5f57"/><circle cx="30" cy="16" r="5" fill="#febc2e"/><circle cx="44" cy="16" r="5" fill="#28c840"/>
    <text x="300" y="21" text-anchor="middle" fill="${COLOR.dim}" font-size="10" font-family="monospace">${name} — Architecture</text>
    <circle cx="300" cy="160" r="36" fill="rgba(0,212,255,.08)" stroke="${COLOR.accent}" stroke-width="1.5"/>
    <text x="300" y="163" text-anchor="middle" fill="${COLOR.accent}" font-size="8" font-family="monospace">API GATEWAY</text>
    <circle cx="160" cy="80" r="${r()}" fill="rgba(0,212,255,.06)" stroke="${COLOR.accent}" stroke-width="1" opacity=".7"/>
    <text x="160" y="83" text-anchor="middle" fill="${COLOR.text}" font-size="7" font-family="monospace" opacity=".7">SERVICE A</text>
    <circle cx="440" cy="80" r="${r()}" fill="rgba(0,255,136,.06)" stroke="${COLOR.accent2}" stroke-width="1" opacity=".7"/>
    <text x="440" y="83" text-anchor="middle" fill="${COLOR.text}" font-size="7" font-family="monospace" opacity=".7">SERVICE B</text>
    <circle cx="120" cy="260" r="${r()}" fill="rgba(0,212,255,.04)" stroke="${COLOR.accent}" stroke-width="1" opacity=".5"/>
    <text x="120" y="263" text-anchor="middle" fill="${COLOR.text}" font-size="7" font-family="monospace" opacity=".5">SERVICE C</text>
    <circle cx="300" cy="270" r="${r()}" fill="rgba(255,107,107,.04)" stroke="${COLOR.accent3}" stroke-width="1" opacity=".5"/>
    <text x="300" y="273" text-anchor="middle" fill="${COLOR.text}" font-size="7" font-family="monospace" opacity=".5">SERVICE D</text>
    <circle cx="480" cy="260" r="${r()}" fill="rgba(0,255,136,.04)" stroke="${COLOR.accent2}" stroke-width="1" opacity=".5"/>
    <text x="480" y="263" text-anchor="middle" fill="${COLOR.text}" font-size="7" font-family="monospace" opacity=".5">SERVICE E</text>
    <line x1="264" y1="145" x2="196" y2="100" stroke="${COLOR.accent}" stroke-width="1" opacity=".3"/>
    <line x1="336" y1="145" x2="404" y2="100" stroke="${COLOR.accent2}" stroke-width="1" opacity=".3"/>
    <line x1="280" y1="180" x2="140" y2="240" stroke="${COLOR.accent}" stroke-width="1" opacity=".2"/>
    <line x1="320" y1="180" x2="300" y2="240" stroke="${COLOR.accent3}" stroke-width="1" opacity=".2"/>
    <line x1="340" y1="175" x2="460" y2="240" stroke="${COLOR.accent2}" stroke-width="1" opacity=".2"/>
    <rect x="160" y="306" width="280" height="22" rx="4" fill="rgba(0,212,255,.06)"/>
    <text x="300" y="320" text-anchor="middle" fill="${COLOR.accent}" font-size="8" font-family="monospace">200+ Services • 3 Regions • 14 Data Centers</text>
  </svg>`;
}

function _svgCodeEditor(name) {
  return `<svg class="pd-svg" viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="340" rx="8" fill="${COLOR.surface}"/>
    <rect x="0" y="0" width="600" height="32" rx="8" fill="${COLOR.bg}"/>
    <circle cx="16" cy="16" r="5" fill="#ff5f57"/><circle cx="30" cy="16" r="5" fill="#febc2e"/><circle cx="44" cy="16" r="5" fill="#28c840"/>
    <text x="300" y="21" text-anchor="middle" fill="${COLOR.dim}" font-size="10" font-family="monospace">${name} — Code</text>
    <rect x="0" y="32" width="120" height="308" fill="${COLOR.bg}" opacity=".5"/>
    <text x="16" y="56" fill="${COLOR.dim}" font-size="9" font-family="monospace">src/</text>
    <text x="20" y="72" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">├─ main.rs</text>
    <text x="20" y="88" fill="${COLOR.accent2}" font-size="9" font-family="monospace">├─ lib.rs</text>
    <text x="20" y="104" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">├─ config/</text>
    <text x="28" y="120" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".4">│  ├─ mod.rs</text>
    <text x="28" y="136" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".4">│  └─ schema.rs</text>
    <text x="20" y="152" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">├─ parser/</text>
    <text x="28" y="168" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".4">│  ├─ mod.rs</text>
    <text x="28" y="184" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".4">│  └─ validator.rs</text>
    <text x="20" y="200" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">├─ benches/</text>
    <text x="28" y="216" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".4">│  └── perf.rs</text>
    <text x="20" y="232" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">├─ Cargo.toml</text>
    <text x="20" y="248" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">└─ README.md</text>
    <rect x="124" y="36" width="472" height="16" rx="2" fill="${COLOR.bg}"/>
    <text x="136" y="48" fill="${COLOR.accent2}" font-size="9" font-family="monospace">fn validate(input: &str) → Result&lt;Schema, Error&gt; {</text>
    <text x="140" y="68" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">    let parsed = Parser::parse(input)?;</text>
    <text x="140" y="84" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">    let schema = Schema::from_ast(parsed);</text>
    <text x="140" y="100" fill="${COLOR.accent}" font-size="9" font-family="monospace">    let report = ValidationReport::new()</text>
    <text x="144" y="116" fill="${COLOR.accent}" font-size="9" font-family="monospace">        .with_strategy(ValidationStrategy::Strict)</text>
    <text x="144" y="132" fill="${COLOR.accent}" font-size="9" font-family="monospace">        .validate(&amp;schema, input)?;</text>
    <text x="140" y="148" fill="${COLOR.accent2}" font-size="9" font-family="monospace">    Ok(report.into_inner())</text>
    <text x="136" y="164" fill="${COLOR.text}" font-size="9" font-family="monospace" opacity=".6">}</text>
    <rect x="124" y="176" width="472" height="1" fill="${COLOR.border}" opacity=".3"/>
    <text x="140" y="200" fill="${COLOR.dim}" font-size="9" font-family="monospace">// Performance: 5.2µs average validation</text>
    <text x="140" y="216" fill="${COLOR.dim}" font-size="9" font-family="monospace">// Memory: 4KB per allocation</text>
    <text x="140" y="232" fill="${COLOR.dim}" font-size="9" font-family="monospace">// Thread-safe: Send + Sync impl</text>
    <rect x="124" y="250" width="472" height="24" rx="4" fill="rgba(0,212,255,.06)"/>
    <text x="140" y="266" fill="${COLOR.accent}" font-size="10" font-family="monospace">λ ~/projects/validator → (main) cargo test — — —nocapture</text>
    <text x="140" y="290" fill="${COLOR.accent2}" font-size="10" font-family="monospace">✓ 248 passed • 0 failed • 94.7% coverage</text>
    <text x="140" y="310" fill="${COLOR.dim}" font-size="9" font-family="monospace">Elapsed: 0.847s   █</text>
  </svg>`;
}

function _svgBlocks(name) {
  return `<svg class="pd-svg" viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="340" rx="8" fill="${COLOR.surface}"/>
    <rect x="0" y="0" width="600" height="32" rx="8" fill="${COLOR.bg}"/>
    <circle cx="16" cy="16" r="5" fill="#ff5f57"/><circle cx="30" cy="16" r="5" fill="#febc2e"/><circle cx="44" cy="16" r="5" fill="#28c840"/>
    <text x="300" y="21" text-anchor="middle" fill="${COLOR.dim}" font-size="10" font-family="monospace">${name} — Network</text>
    <rect x="30" y="60" width="120" height="120" rx="6" fill="rgba(0,212,255,.04)" stroke="${COLOR.accent}" stroke-width="1" opacity=".6"/>
    <text x="90" y="120" text-anchor="middle" fill="${COLOR.accent}" font-size="9" font-family="monospace">BLOCK</text>
    <text x="90" y="137" text-anchor="middle" fill="${COLOR.dim}" font-size="7" font-family="monospace">#221,472</text>
    <text x="90" y="152" text-anchor="middle" fill="${COLOR.dim}" font-size="6" font-family="monospace">0x7f3a…b8e2</text>
    <rect x="180" y="50" width="120" height="120" rx="6" fill="rgba(0,255,136,.04)" stroke="${COLOR.accent2}" stroke-width="1" opacity=".7"/>
    <text x="240" y="110" text-anchor="middle" fill="${COLOR.accent2}" font-size="9" font-family="monospace">BLOCK</text>
    <text x="240" y="127" text-anchor="middle" fill="${COLOR.dim}" font-size="7" font-family="monospace">#221,473</text>
    <text x="240" y="142" text-anchor="middle" fill="${COLOR.dim}" font-size="6" font-family="monospace">0x9c1d…a4f3</text>
    <rect x="330" y="40" width="120" height="120" rx="6" fill="rgba(0,212,255,.04)" stroke="${COLOR.accent}" stroke-width="1" opacity=".8"/>
    <text x="390" y="100" text-anchor="middle" fill="${COLOR.accent}" font-size="9" font-family="monospace">BLOCK</text>
    <text x="390" y="117" text-anchor="middle" fill="${COLOR.dim}" font-size="7" font-family="monospace">#221,474</text>
    <text x="390" y="132" text-anchor="middle" fill="${COLOR.dim}" font-size="6" font-family="monospace">0x4e8f…f1c2</text>
    <rect x="480" y="30" width="120" height="120" rx="6" fill="rgba(255,107,107,.04)" stroke="${COLOR.accent3}" stroke-width="1" opacity=".9"/>
    <text x="540" y="90" text-anchor="middle" fill="${COLOR.accent3}" font-size="9" font-family="monospace">BLOCK</text>
    <text x="540" y="107" text-anchor="middle" fill="${COLOR.dim}" font-size="7" font-family="monospace">#221,475</text>
    <text x="540" y="122" text-anchor="middle" fill="${COLOR.dim}" font-size="6" font-family="monospace">0xd2a7…3c9e</text>
    <line x1="150" y1="120" x2="180" y2="110" stroke="${COLOR.accent}" stroke-width="1" opacity=".4"/>
    <line x1="300" y1="110" x2="330" y2="100" stroke="${COLOR.accent2}" stroke-width="1" opacity=".4"/>
    <line x1="450" y1="100" x2="480" y2="90" stroke="${COLOR.accent}" stroke-width="1" opacity=".4"/>
    <rect x="180" y="200" width="240" height="90" rx="6" fill="${COLOR.bg}" stroke="${COLOR.border}" stroke-width=".5"/>
    <text x="300" y="225" text-anchor="middle" fill="${COLOR.accent}" font-size="9" font-family="monospace" font-weight="bold">Network Summary</text>
    <text x="200" y="248" fill="${COLOR.dim}" font-size="8" font-family="monospace">Validators:</text>
    <text x="280" y="248" fill="${COLOR.accent2}" font-size="8" font-family="monospace">128</text>
    <text x="200" y="266" fill="${COLOR.dim}" font-size="8" font-family="monospace">TPS:</text>
    <text x="280" y="266" fill="${COLOR.accent}" font-size="8" font-family="monospace">2,400</text>
    <text x="340" y="248" fill="${COLOR.dim}" font-size="8" font-family="monospace">Finality:</text>
    <text x="400" y="248" fill="${COLOR.accent}" font-size="8" font-family="monospace">~2s</text>
    <text x="340" y="266" fill="${COLOR.dim}" font-size="8" font-family="monospace">Gas:</text>
    <text x="400" y="266" fill="${COLOR.accent2}" font-size="8" font-family="monospace">12 Gwei</text>
    <rect x="180" y="300" width="240" height="22" rx="4" fill="rgba(0,212,255,.06)"/>
    <text x="300" y="315" text-anchor="middle" fill="${COLOR.accent}" font-size="8" font-family="monospace">300K Identities • ZK-Proof • 8 Protocols</text>
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
  if (window.location.hash) history.replaceState(null, '', window.location.pathname);
}

export { closeProjectDetail };

export function animateCharts() {
  document.querySelectorAll('[data-pd-bar]').forEach((el) => {
    const target = parseFloat(el.dataset.pdBar);
    setTimeout(() => { el.style.width = target + '%'; }, 200);
  });
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
            ${detail.highlights.map((h, i) => _renderCareerChartItem(h, i)).join('')}
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
  requestAnimationFrame(() => animateCharts());
}

function _renderCareerChartItem(h, i) {
  const pct = typeof h.value === 'number' ? Math.min(h.value, 100) : 80;
  const dl = String(h.value).length;
  const isWide = dl > 6 || h.label.length > 18;
  return `<div class="pd-chart-item ${isWide ? 'pd-chart-wide' : ''}" data-pd-animate>
    <div class="pd-chart-label">${h.label}</div>
    <div class="pd-chart-bar-wrap"><div class="pd-chart-bar-fill" style="width:0%" data-pd-bar="${pct}"></div></div>
    <div class="pd-chart-val">${h.value}${h.unit ? ' ' + h.unit : ''}</div>
  </div>`;
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
  const scrollContainer = document.querySelector('[data-scroll-container]');
  if (scrollContainer) scrollContainer.style.overflow = 'hidden';
}
