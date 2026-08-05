import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PONYTAIL from './config/ponytail.config.js';
import { initMode, getMode, setMode } from './themes/themeManager.js';
import { initDesktop } from './themes/desktop/desktop.js';
import { initTerminal, refreshTerminalLocale } from './themes/terminal/terminal.js';
import PortfolioOrchestrator from './core/orchestrator.js';
import { initAnalytics } from './lib/analytics.js';
import { captureAttribution } from './lib/attribution.js';

// First, before anything rewrites the address: the campaign parameters are in
// the query string and the router replaces it as soon as it resolves a route.
captureAttribution();

gsap.registerPlugin(ScrollTrigger);
initMode();
initAnalytics();

const IS_BUSINESS = (document.documentElement.getAttribute('data-mode') || 'business') === 'business';

// --- Scroll ---
ScrollTrigger.config({ ignoreMobileResize: true });

// --- Orchestrator ---
const orchestrator = new PortfolioOrchestrator();
try {
  await orchestrator.init();
} catch (e) {
  console.error('[Portfolio] Init failed:', e);
}

// --- Scroll Timeline ---
// Drives which section the page considers current, which is what the ambient
// audio and the scroll-linked reveals key off. The 3D camera used to ride this
// too; what is left is the part that has visible consequences.
gsap.timeline({
  scrollTrigger: {
    trigger: '#mainContent',
    start: 'top top',
    end: 'bottom top',
    scrub: PONYTAIL.SCRUB,
    onUpdate: (self) => {
      const p = self.progress;
      orchestrator.s.set('progress', p);
      orchestrator._resolveScene(p);
      orchestrator.s.setScene(orchestrator.currentScene, p);
    },
  },
});

// --- Locale Change ---
document.addEventListener('locale:change', () => {
  const lang = orchestrator.s.lang;
  const locale = PONYTAIL.SEO[lang];
  if (locale) {
    document.title = locale.title;
    document.documentElement.lang = lang.toLowerCase();
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://dev24.pro/${lang.toLowerCase()}`);
  }
  if (getMode() === 'terminal') { refreshTerminalLocale(); _bootTerminal(); }
});

// --- Theme Switcher ---
/**
 * `persist` is off when the theme was decided for the visitor rather than by
 * them. Storing a system-derived value would pin the site to whatever the OS
 * happened to be on the first visit and stop following it afterwards, which is
 * indistinguishable from a stuck switch.
 */
function applyTheme(theme, anim = true, persist = true) {
  if (anim) {
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg);opacity:0;pointer-events:none;transition:opacity .15s ease';
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '.4'; });
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 200);
    }, 150);
  }
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) { try { localStorage.setItem('theme', theme); } catch {} }
  // Business mode paints from --b-bg, not --bg, so reading --bg gave the
  // browser chrome the wrong colour in the mode most visitors actually see.
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    const cs = getComputedStyle(document.documentElement);
    const isBusiness = document.documentElement.getAttribute('data-mode') === 'business';
    metaTheme.content =
      (isBusiness ? cs.getPropertyValue('--b-bg') : cs.getPropertyValue('--bg')).trim() ||
      (theme === 'light' ? '#fafafa' : '#0c0a09');
  }
  document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme } }));
}
// Light unless the visitor has chosen otherwise, or their system asks for dark.
// The head script has already painted this decision; repeating it here is what
// syncs the browser chrome and anything listening for the event.
function storedTheme() {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch { /* private mode */ }
  return ['dark', 'light'].includes(saved) ? saved : null;
}
const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)');
applyTheme(storedTheme() || (systemDark?.matches ? 'dark' : 'light'), false, false);
// Someone who has never touched the switch keeps following their system, so
// the site turns with it at dusk instead of holding the first answer forever.
systemDark?.addEventListener?.('change', (e) => {
  if (storedTheme()) return; // an explicit choice outranks the system
  applyTheme(e.matches ? 'dark' : 'light', false, false);
});
// --- Preloader + Cinematic Reveal ---
(function() {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  const logo = pl.querySelector('.pl-logo');
  const sub = pl.querySelector('.pl-sub');
  setTimeout(() => { logo?.classList.add('show'); }, 200);
  setTimeout(() => { sub?.classList.add('show'); }, 600);
  setTimeout(() => { logo?.classList.add('glitch'); }, 400);
  setTimeout(() => {
    pl.classList.add('hidden');
    setTimeout(() => pl.remove(), 700);
  }, 1800);

  // Cinematic reveal — starts as preloader fades
  setTimeout(() => {
    const intro = document.getElementById('introText');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Phase 2: Intro text stagger
    if (intro) {
      const h1 = intro.querySelector('h1');
      const role = intro.querySelector('.sub');
      const tag = intro.querySelector('.tagline');

      // Reset inline so GSAP can take over
      intro.classList.add('visible');

      tl.from(h1, { y: 35, opacity: 0, duration: 0.6, clearProps: 'transform' }, 0.15)
        .from(role, { y: 18, opacity: 0, duration: 0.45, clearProps: 'transform' }, 0.45)
        .from(tag, { y: 12, opacity: 0, duration: 0.4, clearProps: 'transform' }, 0.7);
    }

    // Phase 3: Stats cascade
    if (!IS_BUSINESS) {
      const so = document.getElementById('statsOverlay');
      if (so) {
        const sectionTitle = so.querySelector('.section-title');
        const items = so.querySelectorAll('.stat-item');
        so.classList.add('visible');
        if (sectionTitle) tl.from(sectionTitle, { y: -10, opacity: 0, duration: 0.3, clearProps: 'transform' }, 0.9);
        items.forEach((item, i) => {
          tl.from(item, { y: 15, opacity: 0, duration: 0.35, clearProps: 'transform' }, 1.0 + i * 0.08);
        });
        tl.call(() => { if (!orchestrator._statsCounted) orchestrator._animateStatsCount(); }, [], 1.5);
      }
    }
  }, 2000);
})();

function openSettings() {
  const popup = document.getElementById('settingsPopup');
  updateSettingsUI();
  popup.style.display = 'flex';
  _settingsOpenedAt = Date.now();
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
  // Language buttons
  const lang = orchestrator?.s?.lang || 'EN';
  document.querySelectorAll('[data-slang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.slang === lang);
  });
}

// iOS drops the synthesised click as soon as a touch drifts a few pixels, and
// this panel is now the only settings surface on the site — reached from the
// gear in every mode and from the desktop's Settings icon. A press that ends
// where it started counts as a tap; a drag still does not.
const TAP_SELECTOR = '.settings-gear, [data-stheme], [data-smode], [data-slang], #settingsClose, #settingsBackdrop';
let _tap = null;
let _tapHandledAt = 0;
let _settingsOpenedAt = 0;

document.addEventListener('pointerdown', (e) => {
  const target = e.target.closest(TAP_SELECTOR);
  _tap = target ? { target, x: e.clientX, y: e.clientY, at: Date.now() } : null;
}, true);

document.addEventListener('pointercancel', () => { _tap = null; }, true);

document.addEventListener('pointerup', (e) => {
  const started = _tap;
  _tap = null;
  if (!started || e.pointerType === 'mouse') return;
  if (Date.now() - started.at > 600) return;
  if (Math.hypot(e.clientX - started.x, e.clientY - started.y) > 14) return;
  if (e.target.closest(TAP_SELECTOR) !== started.target) return;
  _tapHandledAt = Date.now();
  started.target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}, true);

document.addEventListener('click', (e) => {
  // The browser's own click follows the one synthesised above; acting on both
  // would toggle twice. Only the real one is dropped — ours is what does the work.
  if (e.isTrusted && Date.now() - _tapHandledAt < 700 && e.target.closest(TAP_SELECTOR)) return;
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
      if (mode === 'terminal') _bootTerminal();
      updateSettingsUI();
      closeSettings(); // auto-close popup — new mode has different layout
      return;
    }
    // Language option. The panel is the only settings surface, so the switch
    // has to live here as well as in the corner control.
    const langOpt = e.target.closest('[data-slang]');
    if (langOpt) {
      orchestrator.s.lang = langOpt.dataset.slang;
      updateSettingsUI();
      return;
    }
    // Close button or backdrop. Ignored briefly after opening: the desktop's
    // Settings icon takes a double-click, and on touch the second tap of that
    // gesture landed on the backdrop of the panel the first tap had just opened.
    if (e.target.closest('#settingsClose') || e.target.closest('#settingsBackdrop')) {
      if (Date.now() - _settingsOpenedAt > 400) closeSettings();
      return;
    }
    return; // block other clicks while popup is open
  }
  // [data-scroll-to] is handled once, in orchestrator._wireHashRouter — a
  // second handler here made every click scroll twice and push two history
  // entries in business mode.
});

// Terminal mode is now a real shell: everything is reached from the prompt.
// The old static boot block is hidden in CSS and no longer populated here.
function _bootTerminal() {
  initTerminal(orchestrator.s);
}

if (getMode() === 'desktop') {
  initDesktop(orchestrator.s);
}
if (getMode() === 'terminal') {
  _bootTerminal();
}

document.addEventListener('mode:change', (e) => {
  if (e.detail.to === 'desktop') {
    initDesktop(orchestrator.s);
  }
  if (e.detail.to === 'business') {
    ScrollTrigger.refresh();
  }
  if (e.detail.to === 'terminal') {
    _bootTerminal();
  }
});

// Routing lives in orchestrator._wireHashRouter. A second hashchange listener
// used to sit here and reset any unrecognised hash to '', which raced the
// router and made the 404 route unreachable — it appeared and was cleared in
// the same tick.

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const popup = document.getElementById('settingsPopup');
    if (popup.style.display !== 'none') closeSettings();
  }
});

export { orchestrator };
