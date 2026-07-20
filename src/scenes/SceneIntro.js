import * as THREE from 'three';
import PONYTAIL from '../config/ponytail.config.js';

const cfg = PONYTAIL.SCENES[0];
const THEME_ACCENTS = {
  dark: [0xc9a86c, 0x8b7355], cyber: [0x00d4ff, 0x0044ff], terminal: [0x00ff41, 0x004d00], steampunk: [0xc8782a, 0x8b5e00],
};

export default class SceneIntro {
  static config = cfg;

  constructor(world, state) {
    this.group = new THREE.Group();
    this.group.visible = false;
    world.add(this.group);
    this.s = state;
    this.particles = null;
    this.targetPositions = null;
    this._entered = false;
    this._theme = 'cyber';
  }

  _makeColors(theme) {
    const [base, accent] = THEME_ACCENTS[theme] || THEME_ACCENTS.cyber;
    return [new THREE.Color(base), new THREE.Color(accent)];
  }

  _recolor(count, colorsArr, theme) {
    const [base, accent] = this._makeColors(theme);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const c = base.clone().lerp(accent, Math.random() * 0.6);
      const bright = Math.random() > 0.7 ? 1.4 : 1.0;
      colorsArr[i3] = c.r * bright;
      colorsArr[i3 + 1] = c.g * bright;
      colorsArr[i3 + 2] = c.b * bright;
    }
  }

  setTheme(theme) {
    this._theme = theme;
    if (this.particles && this.particles.geometry) {
      const count = this.particles.geometry.attributes.position.count;
      const colors = this.particles.geometry.attributes.color.array;
      this._recolor(count, colors, theme);
      this.particles.geometry.attributes.color.needsUpdate = true;
      this.particles.material.color.set(0xffffff);
    }
  }

  async enter() {
    if (this._entered) { this.group.visible = true; return; }
    this._entered = true;

    const count = cfg.geometry.particleCount;
    this.group.visible = true;

    const spread = cfg.geometry.spread;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);

    const [baseColor, accentColor] = this._makeColors(this._theme);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      sizes[i] = Math.random() * 2.5 + 0.5;
      randoms[i] = Math.random();

      const c = baseColor.clone().lerp(accentColor, Math.random() * 0.6);
      const bright = Math.random() > 0.7 ? 1.4 : 1.0;
      colors[i3] = c.r * bright;
      colors[i3 + 1] = c.g * bright;
      colors[i3 + 2] = c.b * bright;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geo, mat);
    this.group.add(this.particles);

    const name = this.s.lang === 'EN' ? 'ALEKSANDR' : 'ГРИБАКИН';
    const letterCount = name.length;
    const particleSlots = Math.floor(count * 0.5);
    const perLetter = Math.floor(particleSlots / letterCount);

    this.targetPositions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      this.targetPositions[i] = positions[i];
    }

    const letters = name.split('');
    const startX = -(letterCount * 0.35);
    letters.forEach((char, li) => {
      const cx = startX + li * 0.7;
      const baseY = 0;
      const isCh = /[А-Я]/.test(char);
      const glyphWidth = isCh ? 0.55 : 0.3;
      const glyphHeight = 0.6;

      for (let pi = 0; pi < perLetter; pi++) {
        const idx = li * perLetter + pi;
        if (idx >= Math.floor(count * 0.5)) break;
        const i3 = idx * 3;
        this.targetPositions[i3] = cx + (Math.random() - 0.5) * glyphWidth;
        this.targetPositions[i3 + 1] = baseY + (Math.random() - 0.5) * glyphHeight;
        this.targetPositions[i3 + 2] = (Math.random() - 0.5) * 0.15;
      }
    });

    const remaining = Math.floor(count * 0.5);
    for (let i = remaining; i < count; i++) {
      const i3 = i * 3;
      this.targetPositions[i3] = (Math.random() - 0.5) * 0.5;
      this.targetPositions[i3 + 1] = (Math.random() - 0.5) * 1.5;
      this.targetPositions[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }
  }

  update(progress) {
    if (!this.particles) return;
    const p = Math.max(0, Math.min(1, progress));
    this.particles.material.opacity = p;
    this.particles.material.size = 0.07 * (1 + 0.5 * (1 - p));

    const positions = this.particles.geometry.attributes.position.array;
    const randoms = this.particles.geometry.attributes.aRandom.array;
    const count = positions.length / 3;

    const t = 1 - Math.pow(1 - p, 2.5);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (this.targetPositions) {
        positions[i3] += (this.targetPositions[i3] - positions[i3]) * 0.06;
        positions[i3 + 1] += (this.targetPositions[i3 + 1] - positions[i3 + 1]) * 0.06;
        positions[i3 + 2] += (this.targetPositions[i3 + 2] - positions[i3 + 2]) * 0.06;
      }

      if (p > 0.7) {
        const jitter = (1 - p) * 0.02;
        positions[i3] += (Math.random() - 0.5) * jitter;
        positions[i3 + 1] += (Math.random() - 0.5) * jitter;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;

    const [base] = this._makeColors(this._theme);
    this.particles.material.color = base;
    this.particles.material.size = 0.07 * (1 + 0.5 * (1 - p)) + 0.01 * Math.sin(Date.now() * 0.002);
  }

  exit() {
    this.group.visible = false;
  }

  dispose() {
    this.group.children.forEach((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    this.group.parent?.remove(this.group);
  }
}
