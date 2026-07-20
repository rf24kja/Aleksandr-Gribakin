import * as THREE from 'three';
import PONYTAIL from '../config/ponytail.config.js';

const cfg = PONYTAIL.SCENES[1];
const THEME_COLORS = {
  dark: { accent: '#c9a86c', accent2: '#a67c52', line: 0x8b7355, center: 0xc9a86c, bg: 'rgba(12,10,9,0.5)' },
  cyber: { accent: '#00d4ff', accent2: '#00ff88', line: 0x0066ff, center: 0x00d4ff, bg: 'rgba(10,10,15,0.4)' },
  terminal: { accent: '#00ff41', accent2: '#ffb000', line: 0x00aa33, center: 0x00ff41, bg: 'rgba(0,10,0,0.4)' },
  steampunk: { accent: '#c8782a', accent2: '#b8860b', line: 0x8b5e00, center: 0xc8782a, bg: 'rgba(30,20,10,0.4)' },
};

function makeYearTexture(year, accent = '#00d4ff', bg = 'rgba(10,10,15,0.4)') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 64);

  ctx.fillStyle = bg;
  ctx.roundRect ? ctx.roundRect(10, 8, 108, 48, 8) : ctx.fillRect(10, 8, 108, 48);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(10, 8, 108, 48, 8); ctx.stroke(); }
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(year), 64, 36);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeMilestoneTexture(label, accent = '#00d4ff', accent2 = '#00ff88') {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 160, 48);
  ctx.fillStyle = accent + '14';
  ctx.fillRect(0, 0, 160, 48);
  ctx.fillStyle = accent2;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 80, 24);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const MILESTONES = [
  { idx: 0,  year: 2011, label: 'jQuery' },
  { idx: 3,  year: 2014, label: 'React' },
  { idx: 6,  year: 2017, label: 'Go' },
  { idx: 9,  year: 2020, label: 'AWS' },
  { idx: 12, year: 2023, label: 'AI/ML' },
  { idx: 14, year: 2026, label: 'WebGPU' },
];

export default class SceneChronicle {
  static config = cfg;

  constructor(world, state) {
    this.group = new THREE.Group();
    this.group.visible = false;
    world.add(this.group);
    this.s = state;
    this.yearSprites = [];
    this.milestoneSprites = [];
    this._theme = 'cyber';
  }

  setTheme(theme) {
    this._theme = theme;
    const c = THEME_COLORS[theme] || THEME_COLORS.cyber;
    const segments = this.yearSprites.length;
    this.yearSprites.forEach((sprite, i) => {
      const year = 2011 + Math.round((i / (segments - 1)) * 15);
      const tex = makeYearTexture(year, c.accent, c.bg);
      sprite.material.map = tex;
      sprite.material.needsUpdate = true;
    });
    this.milestoneSprites.forEach((sprite, i) => {
      const label = MILESTONES[i]?.label || '';
      const tex = makeMilestoneTexture(label, c.accent, c.accent2);
      sprite.material.map = tex;
      sprite.material.needsUpdate = true;
    });
    if (this.centerRing) this.centerRing.material.color.set(c.center);
    if (this.lines) this.lines.material.color.set(c.line);
  }

  enter() {
    this.group.visible = true;
    const segments = cfg.geometry.segments;
    const c = THEME_COLORS[this._theme] || THEME_COLORS.cyber;

    for (let i = 0; i < segments; i++) {
      const year = 2011 + Math.round((i / (segments - 1)) * 15);
      const tex = makeYearTexture(year, c.accent, c.bg);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(mat);
      const angle = (i / segments) * Math.PI * 2;
      const radius = 3.2;
      sprite.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 0.7) * 1.5 - 1,
        Math.sin(angle) * radius * 0.6,
      );
      sprite.scale.set(0, 0, 1);
      sprite.userData = { idx: i, phase: i / segments, targetScale: 0.5 + 0.3 * Math.sin(i * 0.5), baseAngle: angle, baseRadius: radius };
      this.group.add(sprite);
      this.yearSprites.push(sprite);
    }

    MILESTONES.forEach((m) => {
      const tex = makeMilestoneTexture(m.label, c.accent, c.accent2);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const i = m.idx;
      const angle = (i / segments) * Math.PI * 2;
      const radius = 4.5;
      sprite.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 0.7) * 1.5 - 1.5,
        Math.sin(angle) * radius * 0.6,
      );
      sprite.scale.set(0, 0, 1);
      sprite.userData = { milestone: m, baseAngle: angle, baseRadius: radius };
      this.group.add(sprite);
      this.milestoneSprites.push(sprite);
    });

    const centerGeo = new THREE.RingGeometry(0.8, 1.0, 64);
    const centerMat = new THREE.MeshBasicMaterial({
      color: c.center,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.centerRing = new THREE.Mesh(centerGeo, centerMat);
    this.group.add(this.centerRing);

    const lineGeo = new THREE.BufferGeometry();
    const linePos = new Float32Array(segments * 3 * 2);
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r1 = 2.5 + 0.5 * Math.sin(i * 0.8);
      const r2 = 3.5 + 0.3 * Math.cos(i * 1.2);
      const i6 = i * 6;
      const yOff = Math.sin(i * 0.7) * 1.5 - 1;
      linePos[i6] = Math.cos(angle) * r1;
      linePos[i6 + 1] = yOff;
      linePos[i6 + 2] = Math.sin(angle) * r1 * 0.6;
      linePos[i6 + 3] = Math.cos(angle) * r2;
      linePos[i6 + 4] = yOff + 0.3;
      linePos[i6 + 5] = Math.sin(angle) * r2 * 0.6;
    }
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: c.line,
      transparent: true,
      opacity: 0,
    });
    this.lines = new THREE.LineSegments(lineGeo, lineMat);
    this.group.add(this.lines);
  }

  update(progress) {
    const p = progress;
    const t = Date.now() * 0.001;
    const breathe = 0.5 + 0.5 * Math.sin(t * 0.3);
    const segs = this.yearSprites.length;

    this.yearSprites.forEach((sprite, i) => {
      const delay = i * 0.025;
      const localP = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
      const ease = 1 - Math.pow(1 - localP, 3);
      sprite.material.opacity = ease * 0.7;
      const s = sprite.userData.targetScale * ease;
      sprite.scale.set(s, s, 1);

      const orbit = (p + i * 0.015) * Math.PI * 2;
      const radius = sprite.userData.baseRadius + 0.4 * Math.sin(p * Math.PI * 3 + i);
      sprite.position.x = Math.cos(orbit) * radius;
      sprite.position.z = Math.sin(orbit) * radius * 0.6;
      sprite.position.y = Math.sin(orbit * 0.7) * 1.5 - 1 + 0.2 * Math.sin(p * 4 + i);
    });

    this.milestoneSprites.forEach((sprite) => {
      const m = sprite.userData.milestone;
      const showP = Math.max(0, Math.min(1, (p - 0.25 - (m.idx / segs) * 0.5) / 0.3));
      const ease = 1 - Math.pow(1 - showP, 2);
      sprite.material.opacity = ease * 0.9;
      const s = 0.5 * ease;
      sprite.scale.set(s, s * 0.35, 1);

      const orbit = (p * 0.8 + m.idx * 0.02) * Math.PI * 2;
      sprite.position.x = Math.cos(orbit) * 4.5;
      sprite.position.z = Math.sin(orbit) * 4.5 * 0.6;
      sprite.position.y = Math.sin(orbit * 0.7) * 1.5 - 1.5;
    });

    if (this.centerRing) {
      this.centerRing.material.opacity = p * 0.6 + 0.05 * breathe;
      this.centerRing.scale.setScalar(1 + 0.3 * Math.sin(p * Math.PI * 2 + t * 0.5));
    }

    if (this.lines) {
      this.lines.material.opacity = p * 0.35 + 0.03 * breathe;
      const pos = this.lines.geometry.attributes.position.array;
      for (let i = 0; i < segs; i++) {
        const angleOffset = p * Math.PI * 0.5 + t * 0.05;
        const angle = (i / segs) * Math.PI * 2 + angleOffset;
        const r1 = 2.5 + 0.5 * Math.sin(i * 0.8 + p * 2);
        const r2 = 3.5 + 0.3 * Math.cos(i * 1.2 + p * 1.5);
        const i6 = i * 6;
        const yOff = Math.sin(i * 0.7 + p) * 1.5 - 1;
        pos[i6] = Math.cos(angle) * r1;
        pos[i6 + 1] = yOff;
        pos[i6 + 2] = Math.sin(angle) * r1 * 0.6;
        pos[i6 + 3] = Math.cos(angle + 0.1) * r2;
        pos[i6 + 4] = yOff + 0.3 + 0.2 * Math.sin(p * 3 + i);
        pos[i6 + 5] = Math.sin(angle + 0.1) * r2 * 0.6;
      }
      this.lines.geometry.attributes.position.needsUpdate = true;
    }
  }

  exit() {
    this.group.visible = false;
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (c.material.map) c.material.map.dispose();
        c.material.dispose();
      }
    });
    this.group.parent?.remove(this.group);
  }
}
