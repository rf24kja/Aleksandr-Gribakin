export default class SceneManager {
  constructor(world, state) {
    this.world = world;
    this.s = state;
    this.scenes = new Map();
    this.currentId = null;
    this.prevId = null;
    this._onThemeChange = this._onThemeChange.bind(this);
  }

  register(id, instance) {
    this.scenes.set(id, instance);
  }

  _onThemeChange(e) {
    const theme = e.detail.theme;
    for (const [, inst] of this.scenes) {
      if (inst.setTheme) inst.setTheme(theme);
    }
  }

  listen() {
    document.addEventListener('theme:change', this._onThemeChange);
  }

  unlisten() {
    document.removeEventListener('theme:change', this._onThemeChange);
  }

  update(progress, sceneIndex) {
    let activeId = null;

    for (const [id, inst] of this.scenes) {
      const cfg = inst.constructor.config;
      if (!cfg) continue;
      const [lo, hi] = cfg.range;

      if (progress >= lo && progress < hi) {
        activeId = id;
        if (id !== this.currentId) {
          this.prevId = this.currentId;
          this.currentId = id;
          const prev = this.scenes.get(this.prevId);
          if (prev?.exit) prev.exit();
          if (inst.group) {
            while (inst.group.children.length) {
              const c = inst.group.children[0];
              if (c.geometry) c.geometry.dispose();
              if (c.material) c.material.dispose();
              if (c.texture) c.texture.dispose();
              inst.group.remove(c);
            }
            inst.group.visible = true;
          }
          if (inst.enter) inst.enter(progress);
        }
        const localP = (progress - lo) / (hi - lo);
        if (inst.update) inst.update(Math.max(0, Math.min(1, localP)));
      } else if (id !== this.currentId) {
        if (inst.group) inst.group.visible = false;
      }
    }

    if (!activeId && this.currentId) {
      const last = this.scenes.get(this.currentId);
      if (last?.exit) last.exit();
      if (last?.group) last.group.visible = false;
      this.prevId = this.currentId;
      this.currentId = null;
    }
  }

  dispose() {
    this.unlisten();
    for (const [, inst] of this.scenes) {
      if (inst.dispose) inst.dispose();
    }
    this.scenes.clear();
    this.currentId = null;
    this.prevId = null;
  }
}
