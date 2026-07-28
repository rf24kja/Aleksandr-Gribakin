const SUPER = (() => {
  const _subs = new Map();
  const _state = new Map();
  let _frameCount = 0;
  let _lastFpsCheck = performance.now();
  let _fps = 60;
  let _throttled = false;
  let _rafId = null;


  const _emit = (event, data) => {
    if (_subs.has(event)) _subs.get(event).forEach(fn => fn(data, _readState()));
  };

  const _readState = () => {
    const obj = {};
    _state.forEach((v, k) => obj[k] = v);
    return obj;
  };

  const _fpsLoop = (timestamp) => {
    _frameCount++;
    if (timestamp - _lastFpsCheck >= 1000) {
      _fps = Math.round(_frameCount * 1000 / (timestamp - _lastFpsCheck));
      _frameCount = 0;
      _lastFpsCheck = timestamp;
      if (_fps < 45 && !_throttled) {
        _throttled = true;
        _emit('fps:critical', { fps: _fps, threshold: 45 });
      } else if (_fps >= 55 && _throttled) {
        _throttled = false;
        _emit('fps:restored', { fps: _fps });
      }
      _emit('fps:tick', { fps: _fps, throttled: _throttled });
    }
    _rafId = requestAnimationFrame(_fpsLoop);
  };

  return {
    // --- Lifecycle ---
    init(initial = {}) {
      const defaults = {
        active_language: 'EN',
        scene: 0,
        progress: 0,
        isSubmitting: false,
        audioEnabled: true,
        quality: 'high',
        postFX: { bloom: true, motionBlur: true },
      };
      Object.entries({ ...defaults, ...initial }).forEach(([k, v]) => _state.set(k, v));
      _rafId = requestAnimationFrame(_fpsLoop);
      return this;
    },

    destroy() {
      if (_rafId) cancelAnimationFrame(_rafId);
      _subs.clear();
      _state.clear();
      return this;
    },

    // --- State ---
    get(key) { return _state.get(key); },
    getAll() { return _readState(); },

    set(key, value) {
      const prev = _state.get(key);
      if (prev === value) return this;
      _state.set(key, value);
      _emit(`change:${key}`, { key, value, prev });
      _emit('change', { key, value, prev });
      return this;
    },

    // --- Language ---
    get lang() { return _state.get('active_language'); },
    // A setter's return value is discarded — returning `this` here was a no-op.
    set lang(locale) {
      if (locale !== 'EN' && locale !== 'RU') return;
      this.set('active_language', locale);
      document.documentElement.lang = locale.toLowerCase();
    },
    toggleLang() {
      this.lang = this.lang === 'EN' ? 'RU' : 'EN';
      return this.lang;
    },

    // --- Events ---
    on(event, fn) {
      if (!_subs.has(event)) _subs.set(event, new Set());
      _subs.get(event).add(fn);
      return () => _subs.get(event)?.delete(fn);
    },

    off(event, fn) {
      _subs.get(event)?.delete(fn);
      return this;
    },

    // --- FPS Optimizer ---
    get fps() { return _fps; },
    get isThrottled() { return _throttled; },

    fpsQuality() {
      if (_fps >= 55) return 'high';
      if (_fps >= 30) return 'medium';
      return 'low';
    },

    applyFPSBudget(budget) {
      const fx = _state.get('postFX');
      if (budget === 'high') { fx.bloom = true; fx.motionBlur = true; this.set('quality', 'high'); }
      else if (budget === 'medium') { fx.bloom = true; fx.motionBlur = false; this.set('quality', 'medium'); }
      else { fx.bloom = false; fx.motionBlur = false; this.set('quality', 'low'); }
      this.set('postFX', { ...fx });
    },

    // --- Audio Ambient (delegated to synthAudio.js) ---

    // --- Scene Management ---
    setScene(index, progress) {
      this.set('scene', index);
      this.set('progress', progress);
    },

  };
})();

export default SUPER;
