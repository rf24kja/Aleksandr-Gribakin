const LANG_KEY = 'portfolio-lang';

/**
 * Which language the site should open in.
 *
 * It used to always be EN. Half the content is Russian and the site advertises
 * a /ru alternate, but that URL rendered English and a reader's switch was
 * forgotten on the next load. Order: an explicit earlier choice, then the URL
 * the visitor arrived on, then what their browser asks for.
 */
function initialLanguage() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'EN' || saved === 'RU') return saved;
  } catch { /* private mode */ }
  if (/^\/ru(\/|$)/i.test(location.pathname)) return 'RU';
  if (/^\/en(\/|$)/i.test(location.pathname)) return 'EN';
  const pref = navigator.languages?.[0] || navigator.language || '';
  return /^ru\b/i.test(pref) ? 'RU' : 'EN';
}

const SUPER = (() => {
  const _subs = new Map();
  const _state = new Map();

  const _emit = (event, data) => {
    if (_subs.has(event)) _subs.get(event).forEach(fn => fn(data, _readState()));
  };

  const _readState = () => {
    const obj = {};
    _state.forEach((v, k) => obj[k] = v);
    return obj;
  };

  // There used to be a frame counter here, driving a requestAnimationFrame loop
  // for the whole life of the page. It measured FPS in order to lower the
  // quality of a 3D scene that no longer exists — the readout it fed was hidden
  // in every mode, and the budget it applied wrote state nothing read. A loop
  // that wakes the compositor every frame to reach that conclusion is worse
  // than nothing on a phone, so it is gone with the renderer it served.

  return {
    // --- Lifecycle ---
    init(initial = {}) {
      const defaults = {
        active_language: initialLanguage(),
        scene: 0,
        progress: 0,
        isSubmitting: false,
        audioEnabled: true,
      };
      Object.entries({ ...defaults, ...initial }).forEach(([k, v]) => _state.set(k, v));
      // Defaults go straight into the map, bypassing the lang setter, so the
      // document attribute has to be synced here or it keeps the markup's `en`
      // while the page renders in Russian.
      document.documentElement.lang = String(_state.get('active_language')).toLowerCase();
      return this;
    },

    destroy() {
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
      // Without this the choice lasted until the next reload, so a Russian
      // reader had to switch on every visit.
      try { localStorage.setItem(LANG_KEY, locale); } catch { /* private mode */ }
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

    // --- Scene Management ---
    setScene(index, progress) {
      this.set('scene', index);
      this.set('progress', progress);
    },

  };
})();

export default SUPER;
