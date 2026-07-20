import * as THREE from 'three';
import PONYTAIL from '../config/ponytail.config.js';

const cfg = PONYTAIL.SCENES[2];
const GROUP_COLORS = {
  frontend: 0x61dafb, backend: 0x00add8, infra: 0xff9900,
  data: 0x336791, lang: 0x3178c6, ml: 0xee4c2c, blockchain: 0x888888,
};
const THEME_EDGE = { dark: 0x8b7355, cyber: 0x0066ff, terminal: 0x00aa33, steampunk: 0x8b5e00 };
const THEME_LABEL_BG = { dark: 'rgba(20,17,16,0.6)', cyber: 'rgba(10,10,15,0.6)', terminal: 'rgba(0,10,0,0.6)', steampunk: 'rgba(30,20,10,0.6)' };
const THEME_LABEL_FG = { dark: '#f5efe8', cyber: '#ffffff', terminal: '#00ff41', steampunk: '#d4c9a8' };

export default class SceneTechStack {
  static config = cfg;

  constructor(world, state) {
    this.group = new THREE.Group();
    this.group.visible = false;
    world.add(this.group);
    this.s = state;
    this.nodes = [];
    this.edges = [];
    this._theme = 'cyber';
  }

  _makeLabelTex(label, theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 40;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = THEME_LABEL_BG[theme] || THEME_LABEL_BG.dark;
    ctx.fillRect(0, 0, 128, 40);
    ctx.fillStyle = THEME_LABEL_FG[theme] || THEME_LABEL_FG.dark;
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, 64, 26);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  setTheme(theme) {
    this._theme = theme;
    const ec = THEME_EDGE[theme] || THEME_EDGE.dark;
    this.edges.forEach((e) => { e.line.material.color.set(ec); });
    this.nodes.forEach((n) => {
      const tex = this._makeLabelTex(n.data.label, theme);
      n.label.material.map = tex;
      n.label.material.needsUpdate = true;
    });
  }

  enter() {
    this.group.visible = true;
    const nodeData = cfg.geometry.nodes;
    const edgeData = cfg.geometry.edges;
    const nodeMap = {};

    nodeData.forEach((n, i) => {
      const angle = (i / nodeData.length) * Math.PI * 2;
      const radius = 2.5 + n.size * 0.4;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.5 + i) * 1.2,
        Math.sin(angle) * radius * 0.5,
      );

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(n.size * 0.08, 16, 16),
        new THREE.MeshStandardMaterial({
          color: n.color || GROUP_COLORS[n.group] || 0xffffff,
          emissive: n.color || GROUP_COLORS[n.group] || 0xffffff,
          emissiveIntensity: 0.3,
          metalness: 0.7,
          roughness: 0.2,
          transparent: true,
          opacity: 0,
        }),
      );
      sphere.position.copy(pos);
      sphere.userData = { targetPos: pos.clone(), floatOffset: Math.random() * Math.PI * 2 };
      this.group.add(sphere);

      const tex = this._makeLabelTex(n.label, this._theme);
      const labelMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const label = new THREE.Sprite(labelMat);
      label.position.copy(pos);
      label.position.y += 0.3 + n.size * 0.05;
      label.scale.set(0.6, 0.18, 1);
      this.group.add(label);

      this.nodes.push({ sphere, label, data: n, position: pos });
      nodeMap[n.id] = i;
    });

    edgeData.forEach(([from, to]) => {
      const aIdx = nodeMap[from];
      const bIdx = nodeMap[to];
      if (aIdx === undefined || bIdx === undefined) return;
      const a = this.nodes[aIdx].position;
      const b = this.nodes[bIdx].position;
      const points = [a.clone(), b.clone()];
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mid.y += 0.3;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const curvePoints = curve.getPoints(20);
      const geo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const mat = new THREE.LineBasicMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.Line(geo, mat);
      this.group.add(line);
      this.edges.push({ line, from, to, curve });
    });

    this.group.rotation.x = 0.2;
  }

  update(progress) {
    const p = progress;
    const t = Date.now() * 0.001;
    const breathe = 0.5 + 0.5 * Math.sin(t * 0.25);
    const nodeP = this.nodes.length;

    this.nodes.forEach((n, i) => {
      const delay = i / nodeP;
      const localP = Math.max(0, Math.min(1, (p - delay * 0.3) / (1 - delay * 0.3)));
      const ease = 1 - Math.pow(1 - localP, 3);

      n.sphere.material.opacity = ease;
      n.label.material.opacity = ease;

      const float = Math.sin(p * Math.PI * 2 + n.data.floatOffset + t) * 0.08;
      n.sphere.position.y = n.position.y + float;

      const pulse = 1 + 0.1 * Math.sin(p * 3 + i + t * 1.5);
      n.sphere.scale.setScalar(pulse);
      n.sphere.material.emissiveIntensity = 0.3 + 0.3 * Math.sin(p * 2 + i + t);

      n.label.position.copy(n.sphere.position);
      n.label.position.y += 0.3 + n.data.size * 0.05;
    });

    this.edges.forEach((e, i) => {
      const delay = i / this.edges.length;
      const localP = Math.max(0, Math.min(1, (p - delay * 0.3) / (1 - delay * 0.3)));
      e.line.material.opacity = localP * 0.35;

      if (p > 0) {
        const t = (Math.sin(p * 3 + i) * 0.5 + 0.5) * 0.8 + 0.1;
        e.line.material.color.setHSL(0.55 + 0.15 * Math.sin(p + i), 0.8, 0.5);
      }
    });

    const flyP = p * Math.PI * 0.8;
    this.group.rotation.y = flyP * 0.15;
    this.group.rotation.x = 0.2 + 0.08 * Math.sin(p * Math.PI);
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
