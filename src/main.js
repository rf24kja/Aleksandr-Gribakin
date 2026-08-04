import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PONYTAIL from './config/ponytail.config.js';
import { initMode, getMode, setMode } from './themes/themeManager.js';
import { initDesktop } from './themes/desktop/desktop.js';
import { initTerminal, refreshTerminalLocale } from './themes/terminal/terminal.js';
import PortfolioOrchestrator from './core/orchestrator.js';
import SceneManager from './core/SceneManager.js';

gsap.registerPlugin(ScrollTrigger);
initMode();

const IS_BUSINESS = (document.documentElement.getAttribute('data-mode') || 'business') === 'business';

// Whether to boot the WebGL subsystem at all.
//
// Derived from the canvas rather than from the mode name: all three modes
// currently hide `canvas#webgl` in CSS, so terminal and desktop were
// downloading 667 KB of Three.js and running a render loop every frame to
// paint something nobody can see. Reading the computed style means 3D comes
// back on its own if a mode ever stops hiding the canvas.
const USE_3D = (() => {
  const canvas = document.getElementById('webgl');
  return !!canvas && getComputedStyle(canvas).display !== 'none';
})();

// --- Renderer (only when the canvas is actually visible) ---
let renderer = null, scene = null, camera = null, composer = null, bloomPass = null, world = null;
let THREE = null;
let SceneIntro, SceneChronicle, SceneTechStack, SceneAchievements, SceneCTA;

const bloomConfigs = {
  high: { threshold: 0.3, strength: 1.2, radius: 0.5 },
  medium: { threshold: 0.5, strength: 0.6, radius: 0.3 },
  low: { threshold: 1.0, strength: 0, radius: 0 },
};

if (USE_3D) {
  const [three, composerMod, renderPassMod, bloomMod, intro, chronicle, techStack, achievements, cta] =
    await Promise.all([
      import('three'),
      import('three/addons/postprocessing/EffectComposer.js'),
      import('three/addons/postprocessing/RenderPass.js'),
      import('three/addons/postprocessing/UnrealBloomPass.js'),
      import('./scenes/SceneIntro.js'),
      import('./scenes/SceneChronicle.js'),
      import('./scenes/SceneTechStack.js'),
      import('./scenes/SceneAchievements.js'),
      import('./scenes/SceneCTA.js'),
    ]);

  THREE = three;
  const { EffectComposer } = composerMod;
  const { RenderPass } = renderPassMod;
  const { UnrealBloomPass } = bloomMod;
  SceneIntro = intro.default;
  SceneChronicle = chronicle.default;
  SceneTechStack = techStack.default;
  SceneAchievements = achievements.default;
  SceneCTA = cta.default;

  const canvas = document.getElementById('webgl');
  renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: false, powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.setAttribute('data-reduced-motion', '')
    // The listener reads detail.quality — `level` was silently ignored.
    document.dispatchEvent(new CustomEvent('fx:quality', { detail: { quality: 'low' } }))
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08080c);
  scene.fog = new THREE.FogExp2(0x08080c, 0.012);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  world = new THREE.Group();
  scene.add(world);

  // --- Composer ---
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85);
  bloomPass.threshold = 0.4; bloomPass.strength = 0.8; bloomPass.radius = 0.5;
  composer.addPass(bloomPass);

  // --- Lights ---
  const ambientLight = new THREE.AmbientLight(0x222244, 0.6);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.6);
  rimLight.position.set(-3, 1, -5);
  scene.add(rimLight);
}

// --- Scene Labels ---
const sceneNames = {
  EN: ['15 Years in Code', 'Career Timeline', 'Projects & Impact', 'Milestones', 'Initiate Consult'],
  RU: ['15 лет в коде', 'Карьерный путь', 'Проекты и влияние', 'Достижения', 'Начать консультацию'],
};

// --- Scroll ---
ScrollTrigger.config({ ignoreMobileResize: true });

const progressBar = document.getElementById('scrollProgress');
const sceneLabel = document.getElementById('scene-label');

// --- Orchestrator ---
const orchestrator = new PortfolioOrchestrator();
console.log('[Portfolio] Before init');
try {
  await orchestrator.init();
  console.log('[Portfolio] Init OK, handlers wired, lang:', orchestrator.s.lang);
} catch (e) {
  console.error('[Portfolio] Init failed:', e);
}

if (sceneLabel) sceneLabel.textContent = sceneNames[orchestrator.s.lang]?.[orchestrator.currentScene] || '';

// --- FPS Display ---
const fpsEl = document.getElementById('fpsCounter');
orchestrator.s.on('fps:tick', ({ fps, throttled }) => {
  if (fpsEl) {
    fpsEl.textContent = `${fps} FPS${throttled ? ' ⚠' : ''}`;
    fpsEl.className = `fps-counter${throttled ? ' warning' : fps > 50 ? ' ok' : ''}`;
  }
});

// --- Scene Manager (only with 3D) ---
let sceneManager = null;
if (USE_3D && world) {
  sceneManager = new SceneManager(world, orchestrator.s);
  sceneManager.register('intro', new SceneIntro(world, orchestrator.s));
  sceneManager.register('chronicle', new SceneChronicle(world, orchestrator.s));
  sceneManager.register('projects', new SceneTechStack(world, orchestrator.s));
  sceneManager.register('achievements', new SceneAchievements(world, orchestrator.s));
  sceneManager.register('cta', new SceneCTA(world, orchestrator.s));
  orchestrator.sceneManager = sceneManager;
}

// --- Scroll Timeline ---
const has3D = USE_3D;
gsap.timeline({
  scrollTrigger: {
    trigger: has3D ? '#scrollSpacer' : '#mainContent',
    start: 'top top',
    end: has3D ? 'bottom bottom' : 'bottom top',
    scrub: PONYTAIL.SCRUB,
    onUpdate: (self) => {
      const p = self.progress;
      orchestrator.s.set('progress', p);
      orchestrator._resolveScene(p);
      orchestrator.s.setScene(orchestrator.currentScene, p);
      // ponytail: business mode hides these — skip DOM updates
      if (!IS_BUSINESS) {
        const spBar = document.getElementById('spBar');
        const spDot = document.getElementById('spDot');
        if (spBar) spBar.style.width = `${p * 100}%`;
        if (spDot) spDot.style.left = `${p * 100}%`;

        if (sceneLabel) {
          const lang = orchestrator.s.lang;
          const idx = orchestrator.currentScene;
          const newLabel = idx >= 0 ? sceneNames[lang]?.[idx] || '' : '';
          if (sceneLabel.textContent !== newLabel) {
            sceneLabel.style.opacity = '0';
            setTimeout(() => { sceneLabel.textContent = newLabel; sceneLabel.style.opacity = '1'; }, 200);
          }
        }
      }

      if (sceneManager) sceneManager.update(p, orchestrator.currentScene);

      if (camera) {
        const idx = orchestrator.currentScene;
        const activeIdx = Math.max(0, Math.min(PONYTAIL.SCENES.length - 1, idx >= 0 ? idx : 0));
        const sceneCfg = PONYTAIL.SCENES[activeIdx];
        if (sceneCfg) {
          const [sP, eP] = sceneCfg.range;
          const local = (p - sP) / (eP - sP);
          const camCfg = sceneCfg.camera;
          const ease = 1 - Math.pow(1 - Math.max(0, Math.min(1, local)), 2);
          camera.position.set(
            THREE.MathUtils.lerp(camCfg.position.from[0], camCfg.position.to[0], ease),
            THREE.MathUtils.lerp(camCfg.position.from[1], camCfg.position.to[1], ease),
            THREE.MathUtils.lerp(camCfg.position.from[2], camCfg.position.to[2], ease),
          );
          camera.fov = THREE.MathUtils.lerp(camCfg.fov.from, camCfg.fov.to, ease);
          camera.updateProjectionMatrix();
        }
      }
    },
  },
});

// --- Resize (3D only) ---
if (USE_3D && renderer && camera && composer) {
  let _resizeTimer;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(_resizeTimer);
    _resizeTimer = requestAnimationFrame(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });
  });
}

// --- Mouse Parallax (3D only) ---
// `updateParallax` used to be a function declaration inside this if-block.
// Module code is strict, so it was block-scoped and invisible to the render
// loop below — the `typeof ... === 'function'` guard there quietly swallowed
// it and the parallax never ran. Hoisted to module scope.
let updateParallax = null;
if (USE_3D) {
  let _mx = 0, _my = 0;
  document.addEventListener('mousemove', (e) => {
    _mx = (e.clientX / window.innerWidth - 0.5) * 2;
    _my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  let _px = 0, _py = 0;
  updateParallax = () => {
    _px += (_mx * 0.02 - _px) * 0.03;
    _py += (-_my * 0.02 - _py) * 0.03;
    scene.position.x = _px;
    scene.position.y = _py;
  };
  updateParallax();
}

// --- Quality (3D only) ---
if (USE_3D) {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMobile && renderer && bloomPass) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    bloomPass.threshold = 0.6; bloomPass.strength = 0.3; bloomPass.radius = 0.3;
    renderer.toneMappingExposure = 0.7;
  }

  if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('fx:quality', { detail: { quality: 'medium' } }))
    }, 1000)
  }

  document.addEventListener('fx:quality', (e) => {
    const { quality } = e.detail;
    if (renderer && bloomPass) {
      renderer.setPixelRatio(quality === 'high' ? Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2) : quality === 'medium' ? 1 : 0.75);
      const bc = bloomConfigs[quality] || bloomConfigs.low;
      bloomPass.threshold = bc.threshold; bloomPass.strength = bc.strength; bloomPass.radius = bc.radius;
      renderer.toneMappingExposure = quality === 'high' ? 1.0 : quality === 'medium' ? 0.8 : 0.6;
    }
  });

  // --- Mobile 3D Fallback ---
  if (window.innerWidth < 768) {
    setTimeout(() => {
      const fpsText = document.getElementById('fpsCounter')?.textContent || ''
      const fps = Number(fpsText.split(' ')[0])
      if (fps > 0 && fps < 30 && renderer) {
        renderer.setAnimationLoop(null)
        document.querySelector('canvas#webgl').style.display = 'none'
      }
    }, 5000)
  }
}

// --- Render Loop (3D only) ---
if (USE_3D && composer) {
  (function animate() { requestAnimationFrame(animate); if (updateParallax) updateParallax(); if (!document.hidden) composer.render(); })();
}

// --- Locale Change ---
document.addEventListener('locale:change', () => {
  const lang = orchestrator.s.lang;
  const locale = PONYTAIL.SEO[lang];
  if (locale) {
    document.title = locale.title;
    document.documentElement.lang = lang.toLowerCase();
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://dev24.pro/${lang.toLowerCase()}`);
  }
  if (sceneManager) {
    const intro = sceneManager.scenes.get('intro');
    if (intro && intro._entered) {
      intro._entered = false;
      intro.dispose();
      sceneManager.scenes.set('intro', new SceneIntro(world, orchestrator.s));
    }
  }
  const idx = orchestrator.currentScene;
  if (idx >= 0 && sceneLabel) sceneLabel.textContent = sceneNames[orchestrator.s.lang]?.[idx] || '';
  if (getMode() === 'terminal') { refreshTerminalLocale(); _bootTerminal(); }
});

// --- Theme Switcher ---
const themeConfigs = {
  dark: { bg: 0x0c0a09, fog: 0.010, bloom: { threshold: 0.5, strength: 0.6, radius: 0.4 } },
  // Light is a business-mode-only theme today, so this never runs — but the
  // lookup used to fall through to `dark` and paint a dark 3D scene behind a
  // light page if that ever changed.
  light: { bg: 0xf5f3f0, fog: 0.006, bloom: { threshold: 0.8, strength: 0.25, radius: 0.3 } },
};
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
  const cfg = themeConfigs[theme] || themeConfigs.dark;
  if (scene) {
    scene.background = new THREE.Color(cfg.bg);
    scene.fog = new THREE.FogExp2(cfg.bg, cfg.fog);
  }
  if (renderer) renderer.setClearColor(cfg.bg, 1);
  if (bloomPass) { bloomPass.threshold = cfg.bloom.threshold; bloomPass.strength = cfg.bloom.strength; bloomPass.radius = cfg.bloom.radius; }
  document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme } }));
}
// Light unless the visitor has chosen otherwise, or their system asks for dark.
// The head script has already painted this decision; repeating it here is what
// syncs the 3D scene, the browser chrome and anything listening for the event.
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
    const sp = document.getElementById('scrollProgress');
    if (sp) sp.classList.add('ready');
  }, 1800);

  // Cinematic reveal — starts as preloader fades
  setTimeout(() => {
    const pw = !IS_BUSINESS ? document.getElementById('portrait-wrap') : null;
    const intro = document.getElementById('introText');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Phase 1: Portrait bloom-in (skip in business mode)
    if (pw) {
      pw.classList.add('visible');
      const img = document.getElementById('portrait');
      if (img) {
        tl.fromTo(img, { filter: 'grayscale(1) contrast(1.6) brightness(0.3) blur(10px)', opacity: 0 }, {
          filter: 'grayscale(.6) contrast(1.2) brightness(.7) blur(0)', opacity: 0.15,
          duration: 1.2
        }, 0);
      }
    }

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

if (sceneManager) {
  sceneManager.listen();
  sceneManager.update(0, 0);
}

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

console.log(`[Portfolio] ${PONYTAIL.LOCALE.EN.PROJECTS.length} projects, ${PONYTAIL.SCENES.length} scenes`);

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

export { renderer, scene, camera, world, composer, orchestrator, sceneManager };
