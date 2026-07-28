import PONYTAIL from '../config/ponytail.config.js';
import SUPER from './superpowers.state.js';
import { gsap } from 'gsap';
import { validateForm, animateSubmission } from '../lib/validation.js';
import { startAmbient, fadeTo as audioFadeTo, initOnUserGesture } from '../lib/synthAudio.js';
import { renderProjectPage, renderCareerPage, renderAchievementPage, setProjectLocale, closeProjectDetail } from '../lib/projectDetail.js';
import { CAREER_DETAIL } from '../data/projects.js';
import { computeStats, computeProjectAggregates, projectSortValue } from '../lib/stats.js';
import {
  renderStatCards, wireStatCards, animateStatValues,
  renderDashboard, animateDashboard,
} from '../lib/statsUI.js';

export default class PortfolioOrchestrator {
  constructor() {
    this.s = SUPER;
    this.sceneManager = null;
    this.scenes = PONYTAIL.SCENES;
    this.currentScene = -1;
    this._rendered = false;
    this._activeCat = null;
    this._sortMode = 'default';
    this._entranceObserver = null;
  }

  async init() {
    this.s.init({ active_language: this._detectLocale() });

    await     this._bootSequence();
    this._renderContent();
    this._wireLanguageToggle();
    this._wireFPSOptimizer();
    this._wireForm();
    this._wireCoffeeEgg();
    this._wireProjectClicks();
    this._wireCareerAchClicks();
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

  // --- Boot ---
  async _bootSequence() {
    const boot = document.getElementById('bootScreen');
    if (!boot) return;
    const lines = this._l().BOOT_LINES;
    const lineEls = [];

    for (let i = 0; i < lines.length; i++) {
      const el = document.createElement('div');
      el.className = 'boot-line';
      boot.appendChild(el);
      lineEls.push(el);
    }
    boot.querySelector('.boot-line')?.remove();

    const cursor = document.createElement('div');
    cursor.className = 'boot-line cursor-blink';
    cursor.style.marginTop = '6px';
    cursor.style.opacity = '1';
    cursor.textContent = '█';
    boot.appendChild(cursor);

    for (let i = 0; i < lines.length; i++) {
      lineEls[i].classList.add('active', 'done');
      await this._typeText(lineEls[i], lines[i], 20);
      await new Promise((r) => setTimeout(r, 180));
    }
    cursor.remove();

    await new Promise((r) => setTimeout(r, 400));
    boot.classList.add('hidden');
    await new Promise((r) => setTimeout(r, 800));
    boot.remove();
  }

  _typeText(el, text, speed = 25) {
    return new Promise((resolve) => {
      let i = 0;
      const iv = setInterval(() => {
        el.textContent = text.slice(0, i + 1);
        i++;
        if (i >= text.length) { clearInterval(iv); resolve(); }
      }, speed);
    });
  }

  // --- Content ---
  _renderContent() {
    if (this._rendered) return;
    this._rendered = true;
    this._activeCat = this._l().CATEGORIES[0];
    this._renderStats();
    this._renderCareer();
    this._renderCategoryTabs();
    this._renderProjects();
    this._renderAchievements();
    this._applyI18n();
    this._observeEntrance();
  }

  _reRenderContent() {
    this._activeCat = this._l().CATEGORIES[0];
    this._renderStats();
    this._renderCareer();
    this._renderCategoryTabs();
    this._renderProjects();
    this._renderAchievements();
    this._applyI18n();
    this._entranceObserved = false;
    this._observeEntrance();
  }

  _applyI18n() {
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
    panel.innerHTML = renderDashboard(agg, this._l().DASHBOARD || {}, this._sortMode);
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

    const pw = document.getElementById('portrait-wrap');
    if (pw) pw.classList.toggle('visible', p < 0.20);

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
  _detectLocale() {
    return 'EN';
  }
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

  // --- FPS ---
  _wireFPSOptimizer() {
    this.s.on('fps:critical', () => {
      const b = this.s.fpsQuality();
      this.s.applyFPSBudget(b);
      document.dispatchEvent(new CustomEvent('fx:quality', { detail: { type: 'throttle', quality: b } }));
    });
    this.s.on('fps:restored', () => {
      this.s.applyFPSBudget('high');
      document.dispatchEvent(new CustomEvent('fx:quality', { detail: { type: 'restore', quality: 'high' } }));
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
      const data = { name: fd.get('name'), email: fd.get('email'), message: fd.get('message'), _website: fd.get('_website') };
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
          body: JSON.stringify({ ...data, to: 'RF24KRSK@gmail.com', timestamp: new Date().toISOString() }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.s.set('_lastSubmission', Date.now());
        this._showFormSuccess(form);
      } catch (err) {
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.textContent = PONYTAIL.LOCALE[this.s.lang]?.FORM?.SUBMIT || 'Initiate Consult';
        this._renderFormErrors(form, { _api: err.message });
      }
    });
  }

  _renderFormErrors(form, errors) {
    form.querySelectorAll('[data-field-error]').forEach((el) => { el.textContent = ''; el.style.opacity = '0'; });
    const c = form.querySelector('[data-form-errors]');
    if (c) c.textContent = '';
    const t = PONYTAIL.LOCALE[this.s.lang]?.FORM_ERRORS || {};
    let first = true;
    Object.entries(errors).forEach(([field, key]) => {
      const el = form.querySelector(`[data-field-error="${field}"]`);
      if (!el) return;
      if (field === '_api') {
        const msg = (key + '').toLowerCase().includes('rate') ? t.RATE_LIMIT : t.NETWORK;
        el.textContent = msg || key;
      } else {
        // FORM_ERRORS keys the message field as MSG_*, but the field is named
        // "message" — so MESSAGE_MIN never resolved and the raw rule name
        // ("min") was shown to the visitor.
        const prefix = field === 'message' ? 'MSG' : field.toUpperCase();
        el.textContent = t[`${prefix}_${key}`.toUpperCase()] || key;
      }
      el.style.opacity = '1';
      if (first && c && field !== '_api') { c.textContent = el.textContent; first = false; }
    });
  }

  _clearFormErrors(form) { form.querySelectorAll('[data-field-error]').forEach((el) => { el.textContent = ''; el.style.opacity = '0'; }); }

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

  // --- Coffee Easter Egg ---
  _wireCoffeeEgg() {
    const egg = document.getElementById('coffeeEgg');
    const popup = document.getElementById('coffeePopup');
    if (!egg || !popup) return;
    egg.addEventListener('click', () => popup.classList.add('active'));
    popup.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-coffee]')) popup.classList.remove('active');
      if (e.target.closest('[data-copy-trx]')) {
        const addr = popup.querySelector('.coffee-popup-addr');
        const btn = e.target.closest('[data-copy-trx]');
        navigator.clipboard?.writeText(addr?.textContent || '');
        btn.textContent = PONYTAIL.LOCALE[this.s.lang]?.COFFEE?.DONE || '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = PONYTAIL.LOCALE[this.s.lang]?.COFFEE?.COPY || 'Copy Address'; btn.classList.remove('copied'); }, 2000);
      }
    });
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
      if (project) { this._showSkeleton(); renderProjectPage(project[1]); handled = true; }
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
      if (h && !handled) {
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
