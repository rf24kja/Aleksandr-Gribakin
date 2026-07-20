import * as THREE from 'three';
import PONYTAIL from '../config/ponytail.config.js';

const cfg = PONYTAIL.SCENES[4];
const THEME = {
  dark: { grid: 0xc9a86c, grid2: 0x3a3020, scan: 0xc9a86c, corner: 0xa67c52 },
  cyber: { grid: 0x00d4ff, grid2: 0x003366, scan: 0x00d4ff, corner: 0x00ff88 },
  terminal: { grid: 0x00ff41, grid2: 0x003300, scan: 0x00ff41, corner: 0xffb000 },
  steampunk: { grid: 0xc8782a, grid2: 0x3a2210, scan: 0xc8782a, corner: 0xb8860b },
};

export default class SceneCTA {
  static config = cfg;

  constructor(world, state) {
    this.group = new THREE.Group();
    this.group.visible = false;
    world.add(this.group);
    this.s = state;
    this._theme = 'cyber';
  }

  setTheme(theme) {
    this._theme = theme;
    const t = THEME[theme] || THEME.dark;
    if (this.grid) this.grid.material.color.set(t.grid);
    if (this.scanLine) this.scanLine.material.color.set(t.scan);
    this.group.children.forEach((child) => {
      if (child.userData?.isCorner && child.material.color) {
        child.material.color.set(t.corner);
      }
    });
  }

  enter() {
    this.group.visible = true;
    const t = THEME[this._theme] || THEME.dark;

    const gridHelper = new THREE.GridHelper(6, 20, t.grid, t.grid2);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0;
    this.grid = gridHelper;
    this.group.add(gridHelper);

    const scanGeo = new THREE.PlaneGeometry(5, 0.03);
    const scanMat = new THREE.MeshBasicMaterial({
      color: t.scan,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.scanLine = new THREE.Mesh(scanGeo, scanMat);
    this.scanLine.position.y = -1.5;
    this.group.add(this.scanLine);

    const cornerMat = new THREE.LineBasicMaterial({
      color: t.corner,
      transparent: true,
      opacity: 0,
    });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const size = 0.5;
      const x = Math.cos(angle) * 2.2;
      const z = Math.sin(angle) * 2.2;
      const points = [
        new THREE.Vector3(x - Math.cos(angle) * size, -1.2, z - Math.sin(angle) * size),
        new THREE.Vector3(x, -1.2, z),
        new THREE.Vector3(x - Math.cos(angle + Math.PI / 2) * size, -1.2, z - Math.sin(angle + Math.PI / 2) * size),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, cornerMat.clone());
      line.userData.isCorner = true;
      this.group.add(line);
    }

    this._showForm(true);
  }

  _showForm(visible) {
    const el = document.getElementById('ctaSection');
    if (el) {
      el.classList.toggle('visible', visible);
    }
  }

  update(progress) {
    const p = progress;
    const t = performance.now() * 0.001;

    if (this.grid) {
      this.grid.material.opacity = p * 0.4 + 0.02 * Math.sin(t * 0.3);
      this.grid.position.y = -1.2 - (1 - p) * 0.5;
    }

    if (this.scanLine) {
      this.scanLine.material.opacity = p * 0.6;
      const scanP = (t % 2) / 2;
      this.scanLine.position.y = -1.5 + scanP * 3;
      this.scanLine.scale.x = 1 + 0.2 * Math.sin(scanP * Math.PI * 4);
    }

    this.group.children.forEach((child) => {
      if (child.userData?.isCorner && child.material.color) {
        child.material.opacity = p * 0.8;
      }
    });

  }

  exit() {
    this._showForm(false);
    this.group.visible = false;
  }

  dispose() {
    this._showForm(false);
    this.group.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    this.group.parent?.remove(this.group);
  }
}
