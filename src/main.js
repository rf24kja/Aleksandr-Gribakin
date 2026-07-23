import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PONYTAIL from './config/ponytail.config.js';
import { initMode, getMode, setMode } from './themes/themeManager.js';
import { initDesktop } from './themes/desktop/desktop.js';
import PortfolioOrchestrator from './core/orchestrator.js';
import SceneManager from './core/SceneManager.js';
import SceneIntro from './scenes/SceneIntro.js';
import SceneChronicle from './scenes/SceneChronicle.js';
import SceneTechStack from './scenes/SceneTechStack.js';
import SceneAchievements from './scenes/SceneAchievements.js';
import SceneCTA from './scenes/SceneCTA.js';

gsap.registerPlugin(ScrollTrigger);
initMode();

// --- Renderer ---
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: false, powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.setAttribute('data-reduced-motion', '')
  document.dispatchEvent(new CustomEvent('fx:quality', { detail: { level: 'low' } }))
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08080c);
scene.fog = new THREE.FogExp2(0x08080c, 0.012);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 12);

const world = new THREE.Group();
scene.add(world);

// --- Composer ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85);
bloomPass.threshold = 0.4; bloomPass.strength = 0.8; bloomPass.radius = 0.5;
composer.addPass(bloomPass);

const bloomConfigs = {
  high: { threshold: 0.3, strength: 1.2, radius: 0.5 },
  medium: { threshold: 0.5, strength: 0.6, radius: 0.3 },
  low: { threshold: 1.0, strength: 0, radius: 0 },
};

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0x222244, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);
const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.6);
rimLight.position.set(-3, 1, -5);
scene.add(rimLight);

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

sceneLabel.textContent = sceneNames[orchestrator.s.lang]?.[orchestrator.currentScene] || '';

// --- FPS Display ---
const fpsEl = document.getElementById('fpsCounter');
orchestrator.s.on('fps:tick', ({ fps, throttled }) => {
  if (fpsEl) {
    fpsEl.textContent = `${fps} FPS${throttled ? ' ⚠' : ''}`;
    fpsEl.className = `fps-counter${throttled ? ' warning' : fps > 50 ? ' ok' : ''}`;
  }
});

// --- Scene Manager ---
const sceneManager = new SceneManager(world, orchestrator.s);
sceneManager.register('intro', new SceneIntro(world, orchestrator.s));
sceneManager.register('chronicle', new SceneChronicle(world, orchestrator.s));
sceneManager.register('projects', new SceneTechStack(world, orchestrator.s));
sceneManager.register('achievements', new SceneAchievements(world, orchestrator.s));
sceneManager.register('cta', new SceneCTA(world, orchestrator.s));
orchestrator.sceneManager = sceneManager;

// --- Scroll Timeline ---
gsap.timeline({
  scrollTrigger: {
    trigger: '#scrollSpacer',
    start: 'top top',
    end: 'bottom bottom',
    scrub: PONYTAIL.SCRUB,
    onUpdate: (self) => {
      const p = self.progress;
      orchestrator.s.set('progress', p);
      orchestrator._resolveScene(p);
      orchestrator.s.setScene(orchestrator.currentScene, p);
      const spBar = document.getElementById('spBar');
      const spDot = document.getElementById('spDot');
      if (spBar) spBar.style.width = `${p * 100}%`;
      if (spDot) spDot.style.left = `${p * 100}%`;

      const lang = orchestrator.s.lang;
      const idx = orchestrator.currentScene;
      const newLabel = idx >= 0 ? sceneNames[lang]?.[idx] || '' : '';
      if (sceneLabel.textContent !== newLabel) {
        sceneLabel.style.opacity = '0';
        setTimeout(() => { sceneLabel.textContent = newLabel; sceneLabel.style.opacity = '1'; }, 200);
      }

      sceneManager.update(p, orchestrator.currentScene);

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
    },
  },
});

// --- Resize ---
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

// --- Mouse Parallax ---
let _mx = 0, _my = 0;
document.addEventListener('mousemove', (e) => {
  _mx = (e.clientX / window.innerWidth - 0.5) * 2;
  _my = (e.clientY / window.innerHeight - 0.5) * 2;
});
let _px = 0, _py = 0;
function updateParallax() {
  _px += (_mx * 0.02 - _px) * 0.03;
  _py += (-_my * 0.02 - _py) * 0.03;
  scene.position.x = _px;
  scene.position.y = _py;
}
updateParallax();

// --- Quality ---
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
if (isMobile) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  bloomPass.threshold = 0.6; bloomPass.strength = 0.3; bloomPass.radius = 0.3;
  renderer.toneMappingExposure = 0.7;
}

if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('fx:quality', { detail: { level: 'medium' } }))
  }, 1000)
}

document.addEventListener('fx:quality', (e) => {
  const { quality } = e.detail;
  renderer.setPixelRatio(quality === 'high' ? Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2) : quality === 'medium' ? 1 : 0.75);
  const bc = bloomConfigs[quality] || bloomConfigs.low;
  bloomPass.threshold = bc.threshold; bloomPass.strength = bc.strength; bloomPass.radius = bc.radius;
  renderer.toneMappingExposure = quality === 'high' ? 1.0 : quality === 'medium' ? 0.8 : 0.6;
});

// --- Mobile 3D Fallback ---
if (window.innerWidth < 768) {
  setTimeout(() => {
    const fpsText = document.getElementById('fpsCounter')?.textContent || ''
    const fps = Number(fpsText.split(' ')[0])
    if (fps > 0 && fps < 30) {
      renderer.setAnimationLoop(null)
      document.querySelector('canvas#webgl').style.display = 'none'
    }
  }, 5000)
}

// --- Render Loop ---
(function animate() { requestAnimationFrame(animate); updateParallax(); if (!document.hidden) composer.render(); })();

// --- Locale Change ---
document.addEventListener('locale:change', () => {
  const lang = orchestrator.s.lang;
  const locale = PONYTAIL.SEO[lang];
  if (locale) {
    document.title = locale.title;
    document.documentElement.lang = lang.toLowerCase();
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://dev24.pro/${lang.toLowerCase()}`);
  }
  const intro = sceneManager.scenes.get('intro');
  if (intro && intro._entered) {
    intro._entered = false;
    intro.dispose();
    sceneManager.scenes.set('intro', new SceneIntro(world, orchestrator.s));
  }
  const idx = orchestrator.currentScene;
  if (idx >= 0) sceneLabel.textContent = sceneNames[orchestrator.s.lang]?.[idx] || '';
});

// --- Theme Switcher ---
const themeConfigs = {
  dark: { bg: 0x0c0a09, fog: 0.010, bloom: { threshold: 0.5, strength: 0.6, radius: 0.4 } },
  cyber: { bg: 0x08080c, fog: 0.012, bloom: { threshold: 0.3, strength: 1.2, radius: 0.5 } },
  terminal: { bg: 0x0a0a0a, fog: 0.015, bloom: { threshold: 0.4, strength: 0.6, radius: 0.3 } },
  steampunk: { bg: 0x1a1410, fog: 0.010, bloom: { threshold: 0.5, strength: 0.4, radius: 0.25 } },
};
function applyTheme(theme, anim = true) {
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
  document.querySelectorAll('.theme-btn').forEach(b => b.removeAttribute('aria-current'))
  document.querySelector(`.theme-btn[data-theme="${theme}"]`)?.setAttribute('aria-current', 'true')
  try { localStorage.setItem('theme', theme); } catch {}
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0c0a09';
  document.querySelectorAll('.theme-btn').forEach((b) => b.classList.toggle('active', b.dataset.theme === theme));
  const cfg = themeConfigs[theme] || themeConfigs.dark;
  scene.background = new THREE.Color(cfg.bg);
  scene.fog = new THREE.FogExp2(cfg.bg, cfg.fog);
  renderer.setClearColor(cfg.bg, 1);
  bloomPass.threshold = cfg.bloom.threshold;
  bloomPass.strength = cfg.bloom.strength;
  bloomPass.radius = cfg.bloom.radius;
  document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme } }));
}
let savedTheme = 'dark'; try { savedTheme = localStorage.getItem('theme') || 'dark'; } catch {} finally { savedTheme = savedTheme || 'dark'; }
applyTheme(savedTheme);
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
    const pw = document.getElementById('portrait-wrap');
    const intro = document.getElementById('introText');
    if (!pw && !intro) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Phase 1: Portrait bloom-in (blur → sharp + glow)
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
  }, 2000);
})();

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-btn');
  if (btn && btn.dataset.theme !== document.documentElement.getAttribute('data-theme')) {
    applyTheme(btn.dataset.theme);
  }
  const modeBtn = e.target.closest('[data-mode-switch]');
  if (modeBtn) {
    const modes = ['business', 'desktop'];
    const cur = document.documentElement.getAttribute('data-mode') || 'business';
    const next = modes[(modes.indexOf(cur) + 1) % modes.length];
    setMode(next);
  }
});

sceneManager.listen();
sceneManager.update(0, 0);

if (getMode() === 'desktop') {
  initDesktop(orchestrator.s);
}

document.addEventListener('mode:change', (e) => {
  if (e.detail.to === 'desktop') {
    initDesktop(orchestrator.s);
  }
});

console.log(`[Portfolio] ${PONYTAIL.LOCALE.EN.PROJECTS.length} projects, ${PONYTAIL.SCENES.length} scenes`);

// SPA 404 — unknown hash routes
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (!hash || hash.match(/^\/(project|career|achievement)\/\d+$/)) return;
  if (hash.startsWith('/project/') || hash.startsWith('/career/') || hash.startsWith('/achievement/')) return;
  if (!document.getElementById(hash.replace(/^\//, ''))) {
    location.hash = '';
  }
});

export { renderer, scene, camera, world, composer, orchestrator, sceneManager };
