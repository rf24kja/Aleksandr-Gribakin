const VALIDATION = Object.freeze({
  RULES: {
    name: {
      required: true,
      min: 2,
      max: 64,
      // \p{L} covers every alphabet, so Cyrillic names pass. The typographic
      // apostrophe is listed because iOS and macOS rewrite a typed ' to ’ as
      // you go — without it, O’Brien is rejected as invalid characters.
      pattern: /^[\p{L}\s'’.-]+$/u,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      normalize: (v) => v.trim().toLowerCase(),
    },
    message: {
      required: true,
      min: 10,
      max: 2000,
    },
  },
});

function validateField(field, value) {
  const rule = VALIDATION.RULES[field];
  if (!rule) return null;
  const val = rule.normalize ? rule.normalize(value) : value.trim();
  if (rule.required && !val) return 'required';
  if (rule.min && val.length < rule.min) return 'min';
  if (rule.max && val.length > rule.max) return 'max';
  if (rule.pattern && !rule.pattern.test(val)) return 'pattern';
  return null;
}

export function validateForm(data) {
  const errors = {};
  let valid = true;

  for (const field of ['name', 'email', 'message']) {
    const err = validateField(field, data[field] || '');
    if (err) { errors[field] = err; valid = false; }
  }

  return { valid, errors, data: { name: data.name?.trim(), email: data.email?.trim().toLowerCase(), message: data.message?.trim() } };
}

const HACKER_CHARS = '!<>-_\\/[]{}—=+*^?#________';

function hackerText(el, target, speed = 30) {
  let iteration = 0;
  const interval = setInterval(() => {
    el.textContent = target
      .split('')
      .map((char, i) => {
        if (i < iteration) return target[i];
        return HACKER_CHARS[Math.floor(Math.random() * HACKER_CHARS.length)];
      })
      .join('');
    iteration += 1 / 2;
    if (iteration >= target.length) {
      el.textContent = target;
      clearInterval(interval);
    }
  }, speed);
  return interval;
}

export function animateSubmission(btnEl) {
  const orig = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.style.pointerEvents = 'none';

  const alive = () => btnEl.disabled;

  const steps = [
    () => { if (!alive()) return; btnEl.textContent = 'SEALING_CONNECTION'; hackerText(btnEl, 'SEALING_CONNECTION', 25); },
    (cb) => { setTimeout(() => { if (!alive()) return; hackerText(btnEl, 'ENCRYPTING_PAYLOAD', 20); setTimeout(cb, 800); }, 600); },
    (cb) => { setTimeout(() => { if (!alive()) return; hackerText(btnEl, 'TRANSMITTING', 15); setTimeout(cb, 700); }, 500); },
    (cb) => { setTimeout(() => { if (!alive()) return; hackerText(btnEl, 'ACK_RECEIVED', 20); setTimeout(cb, 1200); }, 400); },
    () => {
      if (!alive()) return;
      btnEl.textContent = '[ CONNECTION ESTABLISHED ]';
      btnEl.style.color = '#00ff88';
      btnEl.disabled = false;
      btnEl.style.pointerEvents = 'auto';
      setTimeout(() => { if (!alive()) return; btnEl.textContent = orig; btnEl.style.color = ''; }, 3000);
    },
  ];

  let i = 0;
  function next() {
    if (i >= steps.length || !alive()) return;
    const fn = steps[i++];
    if (fn.length >= 1) { const cb = i < steps.length ? next : undefined; fn(cb); }
    else { fn(); if (i < steps.length) next(); }
  }
  next();
}

