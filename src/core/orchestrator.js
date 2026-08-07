import PONYTAIL from '../config/ponytail.config.js';
import SUPER from './superpowers.state.js';
import { gsap } from 'gsap';
import { validateForm, animateSubmission } from '../lib/validation.js';
import { startAmbient, fadeTo as audioFadeTo, initOnUserGesture } from '../lib/synthAudio.js';
import {
  renderProjectPage, renderCareerPage, renderAchievementPage, renderWebCasePage,
  setProjectLocale, closeProjectDetail,
} from '../lib/projectDetail.js';
import { CAREER_DETAIL } from '../data/projects.js';
import { computeStats, computeProjectAggregates, projectSortValue, techFrequency } from '../lib/stats.js';
import { trackEvent } from '../lib/analytics.js';
import { attribution } from '../lib/attribution.js';
import { webProjects } from '../data/webProjects.js';
import { PROCESS, CONTACTS, LEGAL, DONATION, hoursLine } from '../data/process.js';
import { wireCopyButtons } from '../lib/copy.js';
import { stackGroups, stackToolCount, backedTools } from '../data/stack.js';
import {
  renderStatCards, wireStatCards, animateStatValues,
  renderDashboard, animateDashboard, esc,
} from '../lib/statsUI.js';

export default class PortfolioOrchestrator {
  constructor() {
    this.s = SUPER;
    this.scenes = PONYTAIL.SCENES;
    this.currentScene = -1;
    this._rendered = false;
    this._activeCat = null;
    this._sortMode = 'default';
    this._entranceObserver = null;
  }

  async init() {
    // No override: the store works out the language from a stored choice, the
    // URL and the browser, and passing anything here silently wins over all
    // three — which is what _detectLocale used to do by returning a constant.
    this.s.init();

    this._renderContent();
    this._wireLanguageToggle();
    this._wireForm();
    this._wireProjectClicks();
    this._wireCareerAchClicks();
    // Delegated on the document: the footer is re-rendered on every language
    // change, so a listener bound to the button itself would not survive one.
    wireCopyButtons(document);
    this._routeFromPath();
    this._wireHashRouter();
    this._wireSEOTags();
    this._updateLangToggleText();

    this.s.on('change:progress', ({ value: p }) => {
      this._updateOverlays(p);
      this._updateYearLabel(p);
    });
    this.s.on('change:active_language', () => {
      this._reRenderContent();
      this._updateLangToggleText();
      document.dispatchEvent(new CustomEvent('locale:change', { detail: { lang: this.s.lang } }));
    });
    this.s.on('change:scene', ({ value }) => { this.currentScene = value; });

    this._updateOverlays(0);
    this._updateYearLabel(0);
    this._resolveScene(0);

    startAmbient(0.4);
    initOnUserGesture();
    return this;
  }

  // --- Content ---
  _renderContent() {
    if (this._rendered) return;
    this._rendered = true;
    this._activeCat = this._l().CATEGORIES[0];
    this._renderStats();
    this._renderCareer();
    this._renderWebProjects();
    this._renderCategoryTabs();
    this._renderProjects();
    this._renderAchievements();
    this._renderStack();
    this._renderProcess();
    this._renderFooter();
    this._applyI18n();
    this._observeEntrance();
  }

  _reRenderContent() {
    this._activeCat = this._l().CATEGORIES[0];
    this._renderStats();
    this._renderCareer();
    this._renderWebProjects();
    this._renderCategoryTabs();
    this._renderProjects();
    this._renderAchievements();
    this._renderStack();
    this._renderProcess();
    this._renderFooter();
    this._applyI18n();
    this._entranceObserved = false;
    this._observeEntrance();
  }

  _applyI18n() {
    // The policy is a real page per locale, so the link has to follow the
    // language the same way the copy above it does.
    const privacyHref = LEGAL.privacy[this.s.lang] || LEGAL.privacy.EN;
    document.querySelectorAll('[data-privacy-link]').forEach((a) => {
      a.setAttribute('href', privacyHref);
    });
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const val = key.split('.').reduce((o, k) => o?.[k], PONYTAIL.LOCALE[this.s.lang]);
      if (val !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = val;
        else el.textContent = val;
      }
    });
  }

  _l() { return PONYTAIL.LOCALE[this.s.lang]; }

  _renderStats() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    this._statsCounted = false;
    // Numbers come from stats.js, computed off the project/career content —
    // there is no hardcoded STATS array to fall out of sync any more.
    this._stats = computeStats(this.s.lang);
    const labels = this._l().STATS_LABELS || {};
    renderStatCards(grid, this._stats, labels);
    wireStatCards(grid, labels);
  }

  /**
   * Client work, above the reference architectures because it is the stronger
   * proof — someone else paid for it.
   *
   * The whole section is built here rather than sitting in index.html, so that
   * an empty list leaves no trace: no heading, no prerendered markup, nothing
   * for a crawler to index as a promise the page does not keep. While the case
   * facts are outstanding every entry is a draft, the list is empty, and the
   * site is exactly what it was.
   */
  _renderWebProjects() {
    const existing = document.getElementById('webOverlay');
    const items = webProjects(this.s.lang);
    if (!items.length) { existing?.remove(); return; }

    const t = this._l().SECTION_TITLES || {};
    const L = this._l().WEB_LABELS || {};
    const anchor = document.getElementById('projectsOverlay');
    if (!anchor) return;

    const section = existing || document.createElement('div');
    section.className = 'section-overlay';
    section.id = 'webOverlay';
    section.innerHTML = `
      <h2 class="section-title">${t.WEB || 'Client Projects'}</h2>
      <p class="section-sub">${t.WEB_SUB || ''}</p>
      <div class="web-grid">
        ${items.map((p) => `
          <button type="button" class="web-card" data-web="${p.id}">
            <span class="web-client">${p.name}</span>
            <span class="web-sector">${p.sector}</span>
            <span class="web-meta">${[p.period, p.capacity].filter(Boolean).join(' · ')}</span>
            <span class="web-outcome">${p.outcome || ''}</span>
            ${p.named ? '' : `<span class="web-nda">${L.UNNAMED || ''}</span>`}
          </button>`).join('')}
      </div>`;
    if (!existing) anchor.parentNode.insertBefore(section, anchor);
  }

  /**
   * The toolbox, folded shut, after the work and before "how I work".
   *
   * Nearly three hundred names laid out flat would bury the ten client cases
   * that are the strongest thing on this page, and a wall of logos is what a
   * portfolio does when it has nothing else to show. So each area opens on
   * demand and the page stays the length it was.
   *
   * Two layers, because the owner read the old arrangement the way a visitor
   * would: a tile saying "47 technologies" beside a toolbox of 294 made the
   * measured number look like the smaller stack. It is the opposite — it is the
   * part with work behind it. So the toolbox marks those entries, and the
   * frequency bars sit underneath as the second layer of one section.
   */
  _renderStack() {
    const anchor = document.getElementById('processOverlay') || document.getElementById('ctaSection');
    if (!anchor) return;
    const t = this._l().SECTION_TITLES || {};
    const groups = stackGroups(this.s.lang);
    // The two layers the section promises: everything, and the part with work
    // on this page. The second is a subset of the first — a test keeps it so,
    // because the copy says "N of M" and that has to stay arithmetic.
    const freq = techFrequency(this._l().PROJECTS);
    const backed = backedTools(freq.map((f) => f.label));
    const section = document.getElementById('stackOverlay') || document.createElement('div');
    section.className = 'section-overlay';
    section.id = 'stackOverlay';
    section.innerHTML = `
      <h2 class="section-title">${esc(t.STACK || 'Toolbox')}</h2>
      <p class="section-sub">${esc((t.STACK_SUB || '').replace('{n}', stackToolCount()))}</p>
      <div class="stack-groups">
        ${groups.map((g) => `
          <details class="stack-group">
            <summary><span class="sg-title">${esc(g.title)}</span><span class="sg-count">${
  new Set(g.lines.flatMap((l) => l.items)).size}</span></summary>
            ${g.note ? `<p class="sg-note">${esc(g.note)}</p>` : ''}
            ${g.lines.map((l) => `
              <div class="sg-line">
                <span class="sg-label">${esc(l.label)}</span>
                <span class="sg-items">${l.items.map((i) => `<span class="sg-item${
  backed.has(i) ? ' sg-backed' : ''}"${backed.has(i) ? ` title="${esc(t.STACK_BACKED || '')}"` : ''}>${esc(i)}</span>`).join('')}</span>
              </div>`).join('')}
          </details>`).join('')}
      </div>
      <div class="stack-backed">
        <div class="sb-title">${esc((t.STACK_BACKED_TITLE || '').replace('{n}', backed.size))}</div>
        <div class="sb-bars">
          ${freq.slice(0, 8).map((f) => `
            <div class="sb-row">
              <span class="sb-label">${esc(f.label)}</span>
              <span class="sb-track"><span class="sb-fill" style="width:${
  Math.round((f.value / (freq[0]?.value || 1)) * 100)}%"></span></span>
              <span class="sb-value">${f.value}</span>
            </div>`).join('')}
        </div>
      </div>`;
    if (!section.parentNode) anchor.parentNode.insertBefore(section, anchor);
  }

  /**
   * "How I work", placed after the proof and before the form: a visitor who
   * has just been convinced asks what it is like to work with him, and that is
   * the question the cases cannot answer.
   */
  _renderProcess() {
    const anchor = document.getElementById('ctaSection');
    if (!anchor) return;
    const lang = this.s.lang;
    const t = this._l().SECTION_TITLES || {};
    const section = document.getElementById('processOverlay') || document.createElement('div');
    section.className = 'section-overlay';
    section.id = 'processOverlay';
    section.innerHTML = `
      <h2 class="section-title">${t.PROCESS || 'How I Work'}</h2>
      <p class="section-sub">${t.PROCESS_SUB || ''}</p>
      <div class="process-list">
        ${PROCESS.map((s) => `
          <div class="process-step">
            <span class="ps-n">${s.n}</span>
            <span class="ps-t">${s.title[lang] || s.title.EN}</span>
            <span class="ps-b">${s.body[lang] || s.body.EN}</span>
          </div>`).join('')}
      </div>`;
    if (!section.parentNode) anchor.parentNode.insertBefore(section, anchor);
  }

  /**
   * The footer exists so a corporate buyer can answer three questions without
   * asking: who is this, when are they reachable, and can they invoice me.
   * Built from data rather than typed into the markup, so the hours here and
   * the hours in step 04 can never disagree.
   */
  _renderFooter() {
    const el = document.getElementById('siteFooter');
    if (!el) return;
    const lang = this.s.lang;
    const f = this._l().FOOTER || {};
    const pick = (o) => o?.[lang] || o?.EN || '';
    el.innerHTML = `
      <div class="f-name">${pick(LEGAL.name)}</div>
      <div class="f-row">${pick(LEGAL.role)}</div>
      <div class="f-row">
        <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a> ·
        <a href="${CONTACTS.telegramUrl}" target="_blank" rel="noopener">${CONTACTS.telegram}</a>
      </div>
      <div class="f-row">${f.HOURS || 'Working hours'}: ${hoursLine(lang)}</div>
      ${this._coffeeMarkup()}
      <div class="f-legal">
        ${pick(LEGAL.basis)}. ${pick(LEGAL.details)}.
        · <a href="${pick(LEGAL.privacy)}" data-privacy-link>${f.PRIVACY || 'Privacy policy'}</a>
        · © ${new Date().getFullYear()}
      </div>`;
  }

  /**
   * The coffee the terminal has always offered, now here too.
   *
   * Folded shut by default and behind <details> rather than a modal: the footer
   * answers a corporate buyer's three questions, and a wallet address sitting
   * open underneath the invoicing line answers a question nobody asked. Whoever
   * wants it opens one line; the layout above is untouched either way.
   */
  _coffeeMarkup() {
    const c = this._l().COFFEE || {};
    return `
      <details class="f-coffee">
        <summary>${c.TITLE || '☕ Buy me a coffee'}</summary>
        <div class="f-coffee-body">
          <span class="f-coffee-net">${c.NETWORK || DONATION.network}</span>
          <code class="f-coffee-addr">${DONATION.address}</code>
          <button type="button" class="f-coffee-copy" data-copy="${DONATION.address}"
            data-copy-done="${c.DONE || '✓ Copied'}">${c.COPY || 'Copy Address'}</button>
        </div>
      </details>`;
  }

  _renderCareer() {
    const list = document.getElementById('careerList');
    if (!list) return;
    const lang = this.s.lang;
    list.innerHTML = this._l().CAREER.map((c, i) => {
      const detail = (CAREER_DETAIL[lang] || CAREER_DETAIL.EN)?.[i];
      const topAch = detail?.keyAchievements?.slice(0, 3) || [];
      return `<button type="button" class="career-item" data-career="${i}">
        <span class="period">${c.period}</span>
        <span class="info">
          <span class="role-company">${c.role} <span class="company">@ ${c.company}</span></span>
          <span class="desc">${c.desc}</span>
          ${topAch.length ? `<span class="career-achs">${topAch.map(a => `<span class="career-ach">▸ ${a}</span>`).join('')}</span>` : ''}
        </span>
      </button>`;
    }).join('');
  }

  _renderCategoryTabs() {
    const container = document.getElementById('catTabs');
    if (!container) return;
    const cats = this._l().CATEGORIES;
    const labels = this._l().CATEGORY_LABELS || cats;
    container.innerHTML = cats.map((cat, i) =>
      `<button type="button" class="cat-tab${cat === this._activeCat ? ' active' : ''}" data-cat="${cat}" aria-pressed="${cat === this._activeCat}">${labels[i]}</button>`
    ).join('');
    if (!container.dataset.wired) {
      container.dataset.wired = '1';
      container.addEventListener('click', (e) => {
        const tab = e.target.closest('.cat-tab');
        if (!tab) return;
        this._activeCat = tab.dataset.cat;
        container.querySelectorAll('.cat-tab').forEach((t) => {
          const on = t.dataset.cat === this._activeCat;
          t.classList.toggle('active', on);
          t.setAttribute('aria-pressed', String(on));
        });
        this._renderProjects();
      });
    }
  }

  /** Projects matching the active category, in the active sort order. */
  _visibleProjects() {
    const all = this._l().PROJECTS;
    const filtered = this._activeCat === this._l().CATEGORIES[0]
      ? [...all]
      : all.filter((p) => p.cat === this._activeCat);
    if (this._sortMode === 'default') return filtered;
    const lang = this.s.lang;
    return filtered.sort(
      (a, b) => projectSortValue(lang, b, this._sortMode) - projectSortValue(lang, a, this._sortMode),
    );
  }

  _renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const filtered = this._visibleProjects();

    // Cards are buttons: the whole grid was previously unreachable by keyboard.
    grid.innerHTML = filtered.map((p) =>
      `<button type="button" class="project-card" data-project-id="${p.id}" data-cat="${p.cat}">
        <span class="card-inner">
          <span class="card-tag">${p.tag}</span>
          <span class="card-title">${p.name}</span>
          <span class="stack">${p.stack}</span>
          <span class="metric">△ ${p.metric}</span>
          <span class="desc">${p.desc}</span>
        </span>
      </button>`
    ).join('');

    this._renderDashboard(filtered);
    this._wireCardTilt();
  }

  _renderDashboard(visible) {
    const panel = document.getElementById('projectsDash');
    if (!panel) return;
    const agg = computeProjectAggregates(this.s.lang, visible);
    panel.innerHTML = renderDashboard(agg, this._l().DASHBOARD || {}, this._sortMode, stackToolCount());
    animateDashboard(panel);

    if (!panel.dataset.wired) {
      panel.dataset.wired = '1';
      panel.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-sort]');
        if (!btn) return;
        this._sortMode = btn.dataset.sort;
        this._renderProjects();
      });
    }
  }

  _wireCardTilt() {
    if (window.innerWidth < 768) return;
    document.querySelectorAll('.project-card').forEach((card) => {
      const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const inner = card.querySelector('.card-inner');
        const t = getTheme();
        if (t === 'dark' && inner) {
          gsap.to(inner, { rotateY: x * 8, rotateX: -y * 8, z: 4, duration: .25, ease: 'power2.out' });
        } else if (t === 'steampunk' && inner) {
          gsap.to(inner, { rotate: x * -4, duration: .3, ease: 'power2.out' });
        } else if (t === 'cyber') {
          gsap.set(card, { boxShadow: `${x * 6}px ${y * 6}px 20px var(--glow-strong)` });
        }
      });
      card.addEventListener('mouseleave', () => {
        const inner = card.querySelector('.card-inner');
        const t = getTheme();
        if (t === 'dark' && inner) {
          gsap.to(inner, { rotateY: 0, rotateX: 0, z: 0, duration: .35, ease: 'power2.out', clearProps: 'transform' });
        } else if (t === 'steampunk' && inner) {
          gsap.to(inner, { rotate: 0, duration: .35, ease: 'power2.out', clearProps: 'transform' });
        } else if (t === 'cyber') {
          gsap.to(card, { boxShadow: 'none', duration: .35, ease: 'power2.out' });
        }
      });
    });
  }

  _observeEntrance() {
    if (this._entranceObserved) return;
    this._entranceObserved = true;
    // A language switch re-renders everything and calls this again — drop the
    // previous observer instead of leaking one per switch.
    this._entranceObserver?.disconnect();
    let statsCounted = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('entered');
          obs.unobserve(entry.target);
        }
      });
      // Trigger stats animation once when any stat-item appears
      if (!statsCounted && entries.some(e => e.target.classList.contains('stat-item') && e.isIntersecting)) {
        statsCounted = true;
        this._animateStatsCount();
      }
    }, { threshold: 0 });
    this._entranceObserver = obs;
    document.querySelectorAll('.career-item, .project-card, .achievement-item, .stat-item')
      .forEach(el => obs.observe(el));
  }

  _animateStatsCount() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    this._statsCounted = true;
    animateStatValues(grid);
  }

  _animateSectionEntry(el) {
    // ponytail: business mode CSS handles all visibility
    if (document.documentElement.getAttribute('data-mode') === 'business') return;
    const title = el.querySelector('.section-title');
    if (title) {
      gsap.fromTo(title, { y: -12, opacity: 0 }, { y: 0, opacity: .8, duration: .6, ease: 'power2.out', clearProps: 'transform' });
    }
    if (el.id === 'statsOverlay') {
      el.querySelectorAll('.stat-item').forEach((item, i) => {
        gsap.fromTo(item, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: .45, delay: i * 0.08, ease: 'power2.out', clearProps: 'transform' });
      });
    }
    if (el.id === 'projectsOverlay') {
      el.querySelectorAll('.cat-tab').forEach((tab, i) => {
        gsap.fromTo(tab, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .3, delay: i * 0.04, ease: 'power2.out', clearProps: 'transform' });
      });
    }
  }

  _renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    grid.innerHTML = this._l().ACHIEVEMENTS.map((a, i) =>
      `<button type="button" class="achievement-item" data-ach="${i}">
        <span class="ach-year">${a.year}</span>
        <span class="ach-title">${a.title}</span>
        <span class="ach-desc">${a.desc}</span>
      </button>`
    ).join('');
  }

  // --- Overlays ---
  _updateOverlays(p) {
    const defs = [
      { id: 'introText', r: [0, 0.18] },
      { id: 'statsOverlay', r: [0, 0.20] },
      { id: 'careerOverlay', r: [0.18, 0.35] },
      { id: 'projectsOverlay', r: [0.35, 0.62] },
      { id: 'achievementsOverlay', r: [0.62, 0.80] },
    ];

    defs.forEach(({ id, r: [lo, hi] }) => {
      const el = document.getElementById(id);
      if (el) {
        const wasVisible = el.classList.contains('visible');
        el.classList.toggle('visible', p >= lo && p < hi);
        if (!wasVisible && el.classList.contains('visible')) this._animateSectionEntry(el);
      }
    });
    if (p >= 0.04 && p < 0.20 && !this._statsCounted) this._animateStatsCount();

    const cta = document.getElementById('ctaSection');
    if (cta) {
      const v = p >= 0.80;
      cta.classList.toggle('visible', v);
      cta.style.opacity = Math.max(0, Math.min(1, (p - 0.78) / 0.06));
      cta.style.transform = `scale(${0.9 + 0.1 * Math.max(0, Math.min(1, (p - 0.78) / 0.06))})`;
    }

    this._animateItems('.career-item', p, 0.18, 0.35, 0.04);
    this._animateItems('.project-card', p, 0.35, 0.62, 0.018, 'translateY');
    this._animateItems('.achievement-item', p, 0.62, 0.80, 0.035, 'scale');
  }

  _animateItems(selector, p, lo, hi, stagger, mode) {
    if (p < lo || p >= hi) return;
    // ponytail: business mode CSS handles all transitions — skip inline styles
    if (document.documentElement.getAttribute('data-mode') === 'business') return;
    const local = (p - lo) / (hi - lo);
    const isCard = selector === '.project-card';
    const theme = isCard ? (document.documentElement.getAttribute('data-theme') || 'dark') : null;
    document.querySelectorAll(selector).forEach((el, i) => {
      const delay = i * stagger;
      const cardP = Math.max(0, Math.min(1, (local - delay) / (1 - delay)));
      el.classList.toggle('visible', cardP > 0);

      if (mode === 'translateY') {
        if (isCard) {
          el.style.opacity = cardP;
          switch (theme) {
            case 'dark':
              el.style.clipPath = '';
              el.style.transform = `translateY(${(1 - cardP) * 25}px)`;
              break;
            case 'cyber':
              el.style.clipPath = '';
              el.style.transform = `translateX(${(i % 2 === 0 ? -1 : 1) * (1 - cardP) * 30}px)`;
              break;
            case 'terminal':
              el.style.transform = '';
              el.style.clipPath = `inset(${(1 - cardP) * 100}% 0 0 0)`;
              break;
            case 'steampunk':
              el.style.clipPath = '';
              el.style.transform = `scaleX(${Math.max(0.01, cardP)})`;
              break;
            default:
              el.style.clipPath = '';
              el.style.transform = `translateY(${(1 - cardP) * 20}px)`;
          }
        } else {
          el.style.transform = `translateY(${(1 - cardP) * 20}px)`;
          el.style.opacity = cardP;
        }
      } else if (mode === 'scale') {
        el.style.transform = `scale(${0.92 + 0.08 * cardP})`;
        el.style.opacity = cardP;
      } else {
        el.style.opacity = cardP > 0 ? 1 : 0;
      }
    });
  }

  _updateYearLabel(p) {
    const el = document.getElementById('yearLabel');
    if (!el) return;
    const [lo, hi] = [0.18, 0.35];
    if (p >= lo && p < hi) {
      const local = (p - lo) / (hi - lo);
      const idx = Math.min(Math.floor(local * this._l().CAREER.length), this._l().CAREER.length - 1);
      const item = this._l().CAREER[idx];
      el.textContent = `${item.company} — ${item.period}`;
      el.style.opacity = 0.5;
    } else {
      el.style.opacity = 0;
    }
  }

  // --- Scene ---
  _resolveScene(progress) {
    for (let i = 0; i < this.scenes.length; i++) {
      const [lo, hi] = this.scenes[i].range;
      if (progress >= lo && progress < hi) {
        if (this.currentScene !== i) {
          this.currentScene = i;
          this.s.set('scene', i);
          this._onSceneEnter(i);
        }
        return;
      }
    }
    if (this.currentScene !== -1 && progress >= 1) this.currentScene = 4;
  }

  _onSceneEnter(index) {
    const scene = this.scenes[index];
    const audioCfg = scene.ambient;
    if (index === 4 && audioCfg.fadeOut) audioFadeTo(0, 2500);
    else if (audioCfg.gain !== undefined && index !== 4) audioFadeTo(audioCfg.gain, 800);

    const locale = this.s.lang;
    document.title = PONYTAIL.SEO[locale].title;
    this._ensureMeta('name', 'description', PONYTAIL.SEO[locale].description);
    this._ensureMeta('name', 'keywords', PONYTAIL.SEO[locale].keywords);
  }

  // --- Language ---
  // All of them: terminal mode renders a second toggle inside its title bar,
  // and querySelector only ever labelled the first one.
  _updateLangToggleText() {
    const label = this.s.lang === 'EN' ? 'RU / EN' : 'EN / RU';
    document.querySelectorAll('[data-lang-switch]').forEach((b) => {
      b.textContent = label;
      b.setAttribute('aria-current', 'true');
    });
  }

  _wireLanguageToggle() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang-switch]');
      if (btn) { this.s.toggleLang(); document.querySelectorAll('[data-lang-switch]').forEach(el => el.setAttribute('aria-current', 'true')); }
    });
  }

  // --- Form ---
  _wireForm() {
    document.addEventListener('submit', async (e) => {
      const form = e.target.closest('[data-form="consult"]');
      if (!form) return;
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const lang = this.s.lang;
      const fd = new FormData(form);
      const data = {
        name: fd.get('name'),
        email: fd.get('email'),
        message: fd.get('message'),
        consent: fd.get('consent'),
        _website: fd.get('_website'),
      };
      if (data._website) return;
      const { valid, errors } = validateForm(data);
      this._renderFormErrors(form, errors);
      if (!valid) return;
      this._clearFormErrors(form);
      btn.classList.add('loading');
      animateSubmission(btn);
      try {
        const res = await fetch('/api/consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Locale': lang },
          body: JSON.stringify({
            ...data,
            to: 'RF24KRSK@gmail.com',
            timestamp: new Date().toISOString(),
            consent: true,
            // So the enquiry arrives labelled with the advert that produced it.
            source: attribution(),
          }),
        });
        if (!res.ok) {
          // The endpoint reports whether the message actually went anywhere.
          // When it did not, say so and offer the address — telling someone
          // "delivered" while the message is dropped loses the enquiry.
          const payload = await res.json().catch(() => ({}));
          const err = new Error(payload.message || `HTTP ${res.status}`);
          err.status = res.status;
          err.recipient = payload.recipient;
          throw err;
        }
        this.s.set('_lastSubmission', Date.now());
        // Counted here and not on the button: the endpoint reports whether the
        // message actually went anywhere, and a goal that fires on the click
        // would quietly understate what an enquiry costs.
        trackEvent('consult', { mode: document.documentElement.dataset.mode || 'business' });
        this._showFormSuccess(form);
      } catch (err) {
        // A failed send is worth counting too. Delivery has broken once while
        // the site was being advertised, and a dashboard is checked far more
        // often than a log.
        trackEvent('consult_failed', { status: err?.status || 0 });
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.textContent = PONYTAIL.LOCALE[this.s.lang]?.FORM?.SUBMIT || 'Initiate Consult';
        this._renderFormErrors(form, { _api: err });
      }
    });
  }

  _renderFormErrors(form, errors) {
    form.querySelectorAll('[data-field-error]').forEach((el) => { el.textContent = ''; el.style.opacity = '0'; });
    const c = form.querySelector('[data-form-errors]');
    if (c) { c.textContent = ''; c.removeAttribute('role'); }
    const t = PONYTAIL.LOCALE[this.s.lang]?.FORM_ERRORS || {};
    let first = true;
    Object.entries(errors).forEach(([field, key]) => {
      // _api is not a field, so there is no [data-field-error] for it. It used
      // to be looked up like one and silently dropped — a failed send showed
      // the visitor nothing at all. It belongs in the form-level summary.
      if (field === '_api') {
        if (c) { c.textContent = this._apiErrorText(key, t); c.setAttribute('role', 'alert'); }
        return;
      }
      const el = form.querySelector(`[data-field-error="${field}"]`);
      if (!el) return;
      // FORM_ERRORS keys the message field as MSG_*, but the field is named
      // "message" — so MESSAGE_MIN never resolved and the raw rule name
      // ("min") was shown to the visitor.
      const prefix = field === 'message' ? 'MSG' : field.toUpperCase();
      el.textContent = t[`${prefix}_${key}`.toUpperCase()] || key;
      el.style.opacity = '1';
      if (first && c) { c.textContent = el.textContent; c.setAttribute('role', 'alert'); first = false; }
    });
  }

  /** Turns a failed /api/consult response into something a visitor can act on. */
  _apiErrorText(err, t) {
    const status = err?.status;
    const raw = String(err?.message ?? err);
    if (status === 429 || raw.toLowerCase().includes('rate')) return t.RATE_LIMIT || raw;
    if (status === 503 || status === 502) {
      // Nothing was delivered. Hand over the address rather than a dead end.
      return (t.DELIVERY_DOWN || 'Could not send. Write to {mail} directly.')
        .replace('{mail}', err?.recipient || 'RF24KRSK@gmail.com');
    }
    return t.NETWORK || raw;
  }

  _clearFormErrors(form) {
    form.querySelectorAll('[data-field-error]').forEach((el) => { el.textContent = ''; el.style.opacity = '0'; });
    // Also the summary, or a delivery failure stays on screen through a retry.
    const c = form.querySelector('[data-form-errors]');
    if (c) { c.textContent = ''; c.removeAttribute('role'); }
  }

  _showFormSuccess(form) {
    const btn = form.querySelector('[type="submit"]');
    btn?.classList.remove('loading');
    if (btn) { btn.disabled = false; btn.style.pointerEvents = 'auto'; }
    const c = form.querySelector('[data-form-success]');
    if (c) {
      c.textContent = this._l().FORM.SUCCESS;
      c.style.opacity = '1';
    }
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 2500);
    setTimeout(() => form.reset(), 3000);
  }

  _showSkeleton() {
    const panel = document.getElementById('projectDetail');
    if (panel) {
      panel.innerHTML = '<div class="pd-panel" style="padding:32px"><div class="pd-skeleton"></div><div class="pd-skeleton"></div><div class="pd-skeleton"></div></div>';
      panel.classList.add('active');
    }
  }

  // --- Detail Pages ---
  _wireProjectClicks() {
    document.addEventListener('click', (e) => {
      const web = e.target.closest('.web-card');
      if (web?.dataset.web) {
        setProjectLocale(this.s.lang);
        this._showSkeleton();
        renderWebCasePage(web.dataset.web);
        history.replaceState(null, '', `#/case/${web.dataset.web}`);
        return;
      }
      const card = e.target.closest('.project-card');
      if (!card) return;
      // Keyed by id rather than by position: the grid can be re-sorted, so an
      // index into the filtered array is no longer a stable identifier.
      const id = card.dataset.projectId;
      if (!id) return;
      setProjectLocale(this.s.lang);
      this._showSkeleton();
      renderProjectPage(id);
      history.replaceState(null, '', `#/project/${id}`);
    });
  }

  _wireCareerAchClicks() {
    document.addEventListener('click', (e) => {
      const career = e.target.closest('.career-item');
      if (career) {
        const idx = parseInt(career.dataset.career);
        setProjectLocale(this.s.lang);
        this._showSkeleton();
        renderCareerPage(idx);
        history.replaceState(null, '', `#/career/${idx}`);
        return;
      }
      const ach = e.target.closest('.achievement-item');
      if (ach) {
        const idx = parseInt(ach.dataset.ach);
        setProjectLocale(this.s.lang);
        this._showSkeleton();
        renderAchievementPage(idx);
        history.replaceState(null, '', `#/achievement/${idx}`);
      }
    });
  }

  /**
   * Adopts a prerendered project URL into the route the router already owns.
   *
   * /project/<id>/ and /ru/project/<id>/ are real documents, so each project is
   * one indexable URL with its own canonical instead of seventeen sharing the
   * homepage. In a browser they are still this single page: the path becomes
   * the hash route, which means opening, closing and the prev/next arrows all
   * keep working without a second code path. The prerendered copy is dropped
   * first — it exists for readers and crawlers without JavaScript, and would
   * otherwise sit underneath the panel showing the same text twice.
   *
   * Runs before the router's own first checkHash(), so that call picks it up.
   */
  _routeFromPath() {
    const path = window.location.pathname;
    const m = path.match(/^\/(?:(en|ru)\/)?(project|career|achievement|case)\/([^/]+)\/?$/i);
    if (!m) return;
    const [, langPrefix, kind, slug] = m;
    const base = langPrefix ? `/${langPrefix.toLowerCase()}/` : '/';

    // Career and milestones are addressed by period and year rather than by
    // index: an index says nothing in a search result and changes meaning the
    // day an entry is inserted. The router works in indices, so the slug is
    // resolved back to one here.
    let hash = null;
    if (kind.toLowerCase() === 'case') {
      hash = `#/case/${slug}`;
    } else if (kind.toLowerCase() === 'project') {
      hash = `#/project/${slug}`;
    } else if (kind.toLowerCase() === 'career') {
      const want = decodeURIComponent(slug);
      const idx = this._l().CAREER.findIndex(
        (c) => c.period.replace(/[–—]/g, '-').replace(/\s+/g, '') === want,
      );
      if (idx >= 0) hash = `#/career/${idx}`;
    } else {
      const want = decodeURIComponent(slug);
      const idx = this._l().ACHIEVEMENTS.findIndex((a) => String(a.year) === want);
      if (idx >= 0) hash = `#/achievement/${idx}`;
    }
    if (!hash) return; // unknown slug: leave the page as the server served it

    document.querySelectorAll('[data-prerendered]').forEach((el) => el.remove());
    history.replaceState(null, '', `${base}${hash}`);
  }

  _wireHashRouter() {
    let lastHash = '';
    const checkHash = () => {
      const h = window.location.hash;
      if (h === lastHash) return;
      lastHash = h;
      setProjectLocale(this.s.lang);
      let handled = false;
      const project = h.match(/^#\/project\/(.+)$/);
      const career = h.match(/^#\/career\/(\d+)$/);
      const achievement = h.match(/^#\/achievement\/(\d+)$/);
      const webCase = h.match(/^#\/case\/(.+)$/);
      if (webCase) { this._showSkeleton(); renderWebCasePage(webCase[1]); handled = true; }
      else if (project) { this._showSkeleton(); renderProjectPage(project[1]); handled = true; }
      else if (career) { this._showSkeleton(); renderCareerPage(parseInt(career[1])); handled = true; }
      else if (achievement) { this._showSkeleton(); renderAchievementPage(parseInt(achievement[1])); handled = true; }

      // Only the not-handled branch used to hide this, so going straight from
      // an unknown route to a valid one rendered the detail behind a 404 that
      // was still on screen.
      if (handled) document.getElementById('page404').style.display = 'none';
      if (!handled) {
        const pd = document.getElementById('projectDetail');
        if (pd) {
          if (pd.classList.contains('active')) closeProjectDetail();
          document.getElementById('page404').style.display = 'none';
        }
      }
      // Smooth scroll for business mode anchor links (e.g. #stats, #projects)
      if (h && !handled && document.documentElement.getAttribute('data-mode') === 'business') {
        const targetId = h.replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
          document.getElementById('page404').style.display = 'none';
          setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
          return;
        }
      }
      // Only an app route can 404. Anything else is a plain anchor — and the
      // CTA itself pushes #ctaSection, so treating every unmatched hash as a
      // missing page meant clicking it and then switching mode buried the site
      // under a full-screen 404 at z-index 9997. An anchor with no target in
      // this mode is simply nothing to scroll to.
      if (h && !handled && /^#\//.test(h)) {
        document.getElementById('page404').style.display = 'flex';
        this._applyI18n();
        return;
      }
    };
    window.addEventListener('hashchange', checkHash);

    // Smooth scroll for anchor-style buttons. This is the only [data-scroll-to]
    // handler on the page; it runs in every mode, but only business mode gets a
    // history entry (the other modes are scroll-driven and would fight it).
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-scroll-to]');
      if (!link) return;
      e.preventDefault();
      const targetId = link.getAttribute('data-scroll-to');
      const target = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (document.documentElement.getAttribute('data-mode') === 'business') {
        history.pushState(null, '', `#${targetId}`);
      }
    });

    checkHash();
  }

  // --- SEO ---
  _ensureMeta(attr, value, content) {
    let el = document.querySelector(`meta[${attr}="${value}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, value); document.head.appendChild(el); }
    el.content = content;
  }

  _wireSEOTags() {
    const locale = this.s.lang;
    document.title = PONYTAIL.SEO[locale].title;
    this._ensureMeta('name', 'description', PONYTAIL.SEO[locale].description);
    this._ensureMeta('name', 'keywords', PONYTAIL.SEO[locale].keywords);
    this._ensureMeta('property', 'og:description', PONYTAIL.SEO[locale].description);
    this._ensureMeta('property', 'og:title', PONYTAIL.SEO[locale].title);
    this._ensureMeta('name', 'twitter:description', PONYTAIL.SEO[locale].description);
    this._ensureMeta('property', 'og:image', 'https://dev24.pro/og-cover.jpg');
    this._ensureMeta('name', 'twitter:image', 'https://dev24.pro/og-cover.jpg');
  }
}
