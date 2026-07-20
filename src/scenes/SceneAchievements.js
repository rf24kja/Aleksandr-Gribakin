import * as THREE from 'three';
import PONYTAIL from '../config/ponytail.config.js';

const cfg = PONYTAIL.SCENES[3];
const THEME_COLORS = {
  dark: [0xc9a86c, 0x8b7355], cyber: [0x00d4ff, 0x0044ff], terminal: [0x00ff41, 0x004d00], steampunk: [0xc8782a, 0x8b5e00],
};

export default class SceneAchievements {
  static config = cfg;

  constructor(world, state) {
    this.group = new THREE.Group();
    this.group.visible = false;
    world.add(this.group);
    this.s = state;
    this._theme = 'cyber';
  }

  _recolor(count, colorsArr, theme) {
    const [base, accent] = THEME_COLORS[theme] || THEME_COLORS.dark;
    const bc = new THREE.Color(base);
    const ac = new THREE.Color(accent);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const c = bc.clone().lerp(ac, Math.random());
      colorsArr[i3] = c.r; colorsArr[i3 + 1] = c.g; colorsArr[i3 + 2] = c.b;
    }
  }

  setTheme(theme) {
    this._theme = theme;
    if (this.particles && this.particles.geometry) {
      const count = this.particles.geometry.attributes.position.count;
      const colors = this.particles.geometry.attributes.color.array;
      this._recolor(count, colors, theme);
      this.particles.geometry.attributes.color.needsUpdate = true;
    }
    if (this.ring) {
      const [base] = THEME_COLORS[theme] || THEME_COLORS.dark;
      this.ring.material.color.set(base);
    }
  }

  enter() {
    this.group.visible = true;

    const count = 28;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.5 + Math.random() * 1.5;
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi) * 0.4;
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      sizes[i] = Math.random() * 2 + 0.5;
    }
    this._recolor(count, colors, this._theme);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.04, vertexColors: true, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false,
    });
    this.particles = new THREE.Points(geo, mat);
    this.group.add(this.particles);

    const ringGeo = new THREE.RingGeometry(2.2, 2.5, 64);
    const [ringColor] = THEME_COLORS[this._theme] || THEME_COLORS.dark;
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.position.z = -0.5;
    this.group.add(this.ring);
  }

  update(progress) {
    const t = performance.now() * 0.001;
    if (this.particles) {
      this.particles.material.opacity = progress;
      this.particles.rotation.y = t * 0.03;
      this.particles.rotation.x = t * 0.008;
    }
    if (this.ring) {
      this.ring.material.opacity = progress * 0.3 + 0.02 * Math.sin(t * 0.5);
      this.ring.scale.setScalar(1 + 0.2 * Math.sin(t * 0.5));
    }
  }

  exit() { this.group.visible = false; }

  dispose() {
    this.group.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    this.group.parent?.remove(this.group);
  }
}
