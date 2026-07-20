let ctx = null;
let master = null;
let nodes = [];
let fadeInterval = null;
let _pendingStart = false;
let _pendingIntensity = 0.4;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return { ctx, master };
}

function _buildGraph(intensity) {
  const { ctx: c, master: m } = getCtx();
  const baseFreq = 55;
  const oscs = [];

  const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = baseFreq;
  const g1 = c.createGain(); g1.gain.value = 0.08;
  const f1 = c.createBiquadFilter(); f1.type = 'lowpass'; f1.frequency.value = 200; f1.Q.value = 5;
  o1.connect(g1); g1.connect(f1); f1.connect(m); o1.start();
  oscs.push({ osc: o1, gain: g1, filter: f1 });

  const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = baseFreq * 1.5;
  const g2 = c.createGain(); g2.gain.value = 0.04;
  const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 350; f2.Q.value = 8;
  o2.connect(g2); g2.connect(f2); f2.connect(m); o2.start();
  oscs.push({ osc: o2, gain: g2, filter: f2 });

  const o3 = c.createOscillator(); o3.type = 'sawtooth'; o3.frequency.value = baseFreq * 2.01;
  const g3 = c.createGain(); g3.gain.value = 0;
  const f3 = c.createBiquadFilter(); f3.type = 'lowpass'; f3.frequency.value = 100; f3.Q.value = 1;
  o3.connect(g3); g3.connect(f3); f3.connect(m); o3.start();
  oscs.push({ osc: o3, gain: g3, filter: f3 });

  const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.15;
  const lfoG = c.createGain(); lfoG.gain.value = 15;
  lfo.connect(lfoG); lfoG.connect(f1.frequency); lfo.start();
  oscs.push({ osc: lfo, gain: lfoG });

  const lfo2 = c.createOscillator(); lfo2.type = 'sine'; lfo2.frequency.value = 0.07;
  const lfoG2 = c.createGain(); lfoG2.gain.value = 30;
  lfo2.connect(lfoG2); lfoG2.connect(f3.frequency); lfo2.start();
  oscs.push({ osc: lfo2, gain: lfoG2 });

  const noise = c.createOscillator(); noise.type = 'sawtooth'; noise.frequency.value = 8000;
  const nG = c.createGain(); nG.gain.value = 0;
  const nF = c.createBiquadFilter(); nF.type = 'bandpass'; nF.frequency.value = 3000; nF.Q.value = 0.5;
  noise.connect(nG); nG.connect(nF); nF.connect(m); noise.start();
  oscs.push({ osc: noise, gain: nG, filter: nF });

  return oscs;
}

export function startAmbient(intensity = 0.4) {
  if (!ctx) {
    _pendingStart = true;
    _pendingIntensity = intensity;
    return;
  }
  stopAmbient();
  nodes = _buildGraph(intensity);
  fadeTo(intensity, 1200);
}

export function tryStartAmbient() {
  if (!_pendingStart) return;
  if (!ctx) getCtx();
  _pendingStart = false;
  stopAmbient();
  nodes = _buildGraph(_pendingIntensity);
  fadeTo(_pendingIntensity, 1200);
}

export function stopAmbient() {
  if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
  nodes.forEach((n) => {
    try { n.osc.stop(); } catch (e) {}
    try { n.osc.disconnect(); } catch (e) {}
    try { n.gain.disconnect(); } catch (e) {}
    if (n.filter) try { n.filter.disconnect(); } catch (e) {}
  });
  nodes = [];
  if (master && ctx) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.02);
}

export function fadeTo(target, duration = 1200) {
  if (!master) return;
  if (fadeInterval) clearInterval(fadeInterval);
  const start = master.gain.value;
  const diff = target - start;
  const steps = Math.max(1, Math.floor(duration / 16));
  let step = 0;
  fadeInterval = setInterval(() => {
    step++;
    const t = Math.min(step / steps, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    master.gain.value = start + diff * eased;
    nodes.forEach((n) => {
      if (n.filter && n.filter.type === 'bandpass') {
        n.filter.frequency.value = 300 + target * 400 * Math.sin(performance.now() * 0.0005 + (n.osc.frequency?.value || 0));
      }
    });
    if (step >= steps) { clearInterval(fadeInterval); fadeInterval = null; }
  }, 16);
}

export function dispose() {
  stopAmbient();
  if (ctx && ctx.state !== 'closed') ctx.close();
  ctx = null; master = null; _pendingStart = false;
}

// One-shot user gesture handler — call on first click/touch/keydown
export function initOnUserGesture() {
  const handler = () => {
    getCtx();
    tryStartAmbient();
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);
    document.removeEventListener('keydown', handler);
    document.removeEventListener('wheel', handler);
  };
  document.addEventListener('click', handler);
  document.addEventListener('touchstart', handler);
  document.addEventListener('keydown', handler);
  document.addEventListener('wheel', handler, { passive: true });
}
