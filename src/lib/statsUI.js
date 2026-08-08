// Rendering for everything numeric on the page.
//
// Kept separate from stats.js on purpose: stats.js knows what the numbers
// mean, this file knows how they look. Neither needs the other's details.

import { formatCompact, splitDisplay, parseMetric, scoreMetric, categoryColor } from './stats.js';

const REDUCED_MOTION = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.hasAttribute('data-reduced-motion');

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// ---------------------------------------------------------------------------
// Counter
// ---------------------------------------------------------------------------

/**
 * Counts up to a display string like "15+", "1M" or "2.4K".
 *
 * The old implementation used Math.round on the parsed float and sliced the
 * suffix by string length, which turned "2.4K" into "2K". This keeps the
 * original decimal precision and treats prefix/suffix as opaque.
 */
export function animateCount(el, display, duration = 1100) {
  const { prefix, number, suffix } = splitDisplay(display);

  if (number === null || REDUCED_MOTION()) {
    el.textContent = display;
    return;
  }

  const decimals = (String(number).split('.')[1] || '').length;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = number * eased;
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = display; // land exactly on the authored string
  };
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// Breakdown bars
// ---------------------------------------------------------------------------

/**
 * A horizontal bar list. Values are scaled against the largest item so the
 * longest bar always fills the track — the comparison being made here is
 * within the list, which is exactly what the reader expects.
 */
export function renderBars(items, { unit = '', compact = false } = {}) {
  if (!items?.length) return '';
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return `<ul class="sb-list${compact ? ' sb-compact' : ''}">${items
    .map((item) => {
      const pct = Math.max(2, (item.value / max) * 100);
      const value = item.meta ?? (Number.isInteger(item.value) ? item.value : formatCompact(item.value));
      const color = item.color || 'var(--sb-accent)';
      return `<li class="sb-row">
        <span class="sb-label">${esc(item.label)}</span>
        <span class="sb-track"><span class="sb-fill" style="--sb-w:${pct.toFixed(1)}%;background:${esc(color)}"></span></span>
        <span class="sb-value">${esc(value)}${unit ? ` <em>${esc(unit)}</em>` : ''}</span>
      </li>`;
    })
    .join('')}</ul>`;
}

// ---------------------------------------------------------------------------
// Headline stat cards
// ---------------------------------------------------------------------------

/**
 * Interactive "Impact By The Numbers" grid.
 *
 * Each card is a real <button> controlling a panel, so keyboard and screen
 * reader support come from the platform rather than from ARIA guesswork. The
 * animated digits are hidden from assistive tech — the button's accessible
 * name carries the final value instead, which is why the container no longer
 * needs aria-live (it used to announce every intermediate number).
 */
export function renderStatCards(grid, stats, labels = {}) {
  grid.innerHTML = stats
    .map((s) => {
      const panelId = `stat-panel-${s.id}`;
      const name = `${s.display} — ${s.label}. ${s.hint}`;
      return `<div class="stat-item" data-stat="${esc(s.id)}">
        <button class="stat-trigger" type="button" aria-expanded="false" aria-controls="${panelId}"
                aria-label="${esc(name)}. ${esc(labels.EXPAND || 'Show breakdown')}">
          <span class="stat-value" data-display="${esc(s.display)}" aria-hidden="true">0</span>
          <span class="stat-label" aria-hidden="true">${esc(s.label)}</span>
          <span class="stat-hint" aria-hidden="true">${esc(s.hint)}</span>
          <span class="stat-chevron" aria-hidden="true"></span>
        </button>
        <div class="stat-panel" id="${panelId}" hidden>
          ${renderBars(s.breakdown.items, { unit: s.breakdown.unit })}
        </div>
      </div>`;
    })
    .join('');
}

/** Click/keyboard handling for the stat grid. Idempotent — safe to re-call. */
export function wireStatCards(grid, labels = {}) {
  if (grid.dataset.wired === '1') return;
  grid.dataset.wired = '1';

  grid.addEventListener('click', (e) => {
    const trigger = e.target.closest('.stat-trigger');
    if (!trigger || !grid.contains(trigger)) return;
    toggleStat(trigger, labels);
  });
}

function toggleStat(trigger, labels) {
  const card = trigger.closest('.stat-item');
  const panel = card.querySelector('.stat-panel');
  const open = trigger.getAttribute('aria-expanded') === 'true';

  trigger.setAttribute('aria-expanded', String(!open));
  card.classList.toggle('open', !open);

  const base = trigger.getAttribute('aria-label').replace(/\.[^.]*$/, '');
  trigger.setAttribute(
    'aria-label',
    `${base}. ${!open ? labels.COLLAPSE || 'Hide breakdown' : labels.EXPAND || 'Show breakdown'}`,
  );

  if (open) {
    panel.hidden = true;
  } else {
    panel.hidden = false;
    // Let the bars grow from zero each time the panel opens.
    panel.querySelectorAll('.sb-fill').forEach((fill, i) => {
      fill.style.width = '0';
      const delay = REDUCED_MOTION() ? 0 : i * 45;
      setTimeout(() => { fill.style.width = fill.style.getPropertyValue('--sb-w'); }, delay);
    });
  }
}

/** Runs the count-up for any stat value that has not animated yet. */
export function animateStatValues(grid) {
  grid.querySelectorAll('.stat-value[data-display]').forEach((el, i) => {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';
    const run = () => animateCount(el, el.dataset.display);
    if (REDUCED_MOTION()) run();
    else setTimeout(run, i * 90);
  });
}

// ---------------------------------------------------------------------------
// Project detail — key metrics
// ---------------------------------------------------------------------------

const GAUGE_R = 26;
const GAUGE_C = 2 * Math.PI * GAUGE_R;

/**
 * Replaces the old `min(round(value), 100)` bars.
 *
 * Percentages get a true gauge — they already have a denominator. Everything
 * else gets a bar whose length is the value's position on a log scale between
 * the smallest and largest comparable metric in the whole portfolio, flipped
 * for "lower is better" metrics so a full bar always means "best". Metrics
 * with no numeric meaning render as a plain badge rather than a fake 80% bar.
 */
export function renderMetricGrid(highlights, scale, t = {}) {
  return highlights.map((h) => renderMetric(h, scale, t)).join('');
}

function renderMetric(h, scale, t) {
  const m = parseMetric(h);

  if (m.kind === 'bool') {
    return `<div class="pm-item pm-flag" data-pd-animate>
      <div class="pm-label">${esc(m.label)}</div>
      <div class="pm-badge pm-badge-yes">${m.raw ? '✓' : '—'}</div>
    </div>`;
  }

  if (m.kind === 'text') {
    return `<div class="pm-item pm-text" data-pd-animate>
      <div class="pm-label">${esc(m.label)}</div>
      <div class="pm-badge">${esc(m.display)}</div>
    </div>`;
  }

  const score = scoreMetric(m, scale);

  if (m.family === 'percent') {
    const pct = Math.max(0, Math.min(100, m.raw));
    const offset = GAUGE_C * (1 - pct / 100);
    return `<div class="pm-item pm-gauge" data-pd-animate title="${esc(m.display)} ${esc(t.OF_TARGET || 'of 100%')}">
      <div class="pm-label">${esc(m.label)}</div>
      <svg class="pm-dial" viewBox="0 0 64 64" role="img" aria-label="${esc(m.label)}: ${esc(m.display)}">
        <circle class="pm-dial-track" cx="32" cy="32" r="${GAUGE_R}" />
        <circle class="pm-dial-fill" cx="32" cy="32" r="${GAUGE_R}"
                stroke-dasharray="${GAUGE_C.toFixed(2)}"
                stroke-dashoffset="${GAUGE_C.toFixed(2)}"
                data-pm-dial="${offset.toFixed(2)}" />
      </svg>
      <div class="pm-value">${esc(m.display)}</div>
    </div>`;
  }

  const dirLabel = m.direction === 'down' ? t.LOWER_BETTER || 'lower is better' : t.HIGHER_BETTER || 'higher is better';
  const rankLabel = score?.rank
    ? (t.RANK || 'rank {r} of {n}').replace('{r}', score.rank).replace('{n}', score.peers)
    : t.SCALE_NOTE || '';
  const width = score ? (score.fill * 100).toFixed(1) : 0;

  return `<div class="pm-item" data-pd-animate title="${esc(`${m.display} — ${dirLabel}. ${rankLabel}`)}">
    <div class="pm-label">${esc(m.label)}
      <span class="pm-dir pm-dir-${m.direction}" aria-hidden="true">${m.direction === 'down' ? '↓' : '↑'}</span>
    </div>
    <div class="pm-track"><span class="pm-fill" data-pm-bar="${width}"></span></div>
    <div class="pm-foot">
      <span class="pm-value">${esc(m.display)}</span>
      ${score?.rank ? `<span class="pm-rank">#${score.rank}<em>/${score.peers}</em></span>` : ''}
    </div>
  </div>`;
}

/** Animates bars and gauges once the detail panel is in the DOM. */
export function animateMetricGrid(root = document) {
  const instant = REDUCED_MOTION();
  root.querySelectorAll('[data-pm-bar]').forEach((el, i) => {
    const w = `${el.dataset.pmBar}%`;
    if (instant) { el.style.width = w; return; }
    setTimeout(() => { el.style.width = w; }, 120 + i * 50);
  });
  root.querySelectorAll('[data-pm-dial]').forEach((el, i) => {
    const off = el.dataset.pmDial;
    if (instant) { el.style.strokeDashoffset = off; return; }
    setTimeout(() => { el.style.strokeDashoffset = off; }, 120 + i * 50);
  });
}

// ---------------------------------------------------------------------------
// Terminal / desktop renderings of the same data
// ---------------------------------------------------------------------------

/** ASCII bar chart for terminal mode. */
export function renderStatsAscii(stats, width = 24) {
  return stats
    .map((s) => {
      const items = s.breakdown.items.slice(0, 6);
      const max = Math.max(...items.map((i) => i.value)) || 1;
      const rows = items
        .map((i) => {
          const filled = Math.max(1, Math.round((i.value / max) * width));
          const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
          const value = i.meta ?? formatCompact(i.value);
          // Column alignment comes from `.ts-key { width: 16ch }`, not padding.
          return `  <span class="ts-key">${esc(i.label)}</span>` +
            `<span class="ts-bar">${bar}</span><span class="ts-val">${esc(value)}</span>`;
        })
        .join('\n');
      return `<div class="ts-block">
        <div class="ts-head"><span class="ts-num">${esc(s.display)}</span> ${esc(s.label)}</div>
        <div class="ts-hint">${esc(s.hint)}</div>
        <div class="ts-rows">${rows}</div>
      </div>`;
    })
    .join('');
}

/**
 * Client-case metrics: what a number was, and what it became.
 *
 * A separate renderer from renderMetricGrid because it answers a different
 * question. That one ranks a figure against every comparable figure in the
 * portfolio, which is the right frame for a reference architecture. A client
 * case is not competing with anything — it is a before and an after, and the
 * distance between them is the whole point.
 *
 * Three shapes, and which one appears is decided by the data rather than by a
 * flag, so a case can never claim more precision than it has:
 *
 *   before + after  two bars scaled against the larger of the pair, with the
 *                   change stated in words underneath.
 *   after only      one bar at full width. Honest: something was measured
 *                   afterwards and nothing before.
 *   delta only      a badge. "+35% conversion" is a real result and a fake
 *                   chart of it would be an invented baseline.
 */
export function renderCaseMetrics(metrics = [], t = {}) {
  if (!metrics.length) return '';
  return metrics.map((m) => {
    const unit = m.unit ? ` ${m.unit}` : '';
    const fmt = (v) => `${formatCompact(v)}${unit}`;

    if (m.before !== undefined && m.after !== undefined) {
      const max = Math.max(m.before, m.after) || 1;
      const lower = m.better === 'lower';
      // A bar never goes to nothing. Five minutes against two days is 0.17% of
      // the track, which rounds to a zero-width bar — invisible, and read as a
      // rendering fault rather than as the win it is.
      const width = (v) => `${Math.max(3, Math.round((v / max) * 100))}%`;
      // One decimal when the whole number would round to 100: "−100%" claims
      // the figure reached zero, which is a different and untrue statement.
      const pct = (x) => (Math.round(x) >= 100 && x < 100 ? x.toFixed(1) : String(Math.round(x)));
      const change = m.before === 0 ? '' : (lower
        ? `−${pct((1 - m.after / m.before) * 100)}%`
        : `+${pct((m.after / m.before - 1) * 100)}%`);
      return `<div class="cm-item" data-pd-animate>
        <div class="cm-label">${esc(m.label)}</div>
        <div class="cm-pair">
          <span class="cm-side">${esc(t.BEFORE || 'before')}</span>
          <span class="cm-track"><span class="cm-fill cm-was" style="--w:${width(m.before)}"></span></span>
          <span class="cm-num cm-was-num">${esc(m.displayBefore || fmt(m.before))}</span>
        </div>
        <div class="cm-pair">
          <span class="cm-side">${esc(t.AFTER || 'after')}</span>
          <span class="cm-track"><span class="cm-fill cm-now" style="--w:${width(m.after)}"></span></span>
          <span class="cm-num cm-now-num">${esc(m.displayAfter || fmt(m.after))}</span>
        </div>
        ${change ? `<div class="cm-change ${lower ? 'cm-good-down' : 'cm-good-up'}">${esc(change)}</div>` : ''}
      </div>`;
    }

    if (m.after !== undefined) {
      const of = m.of || m.after;
      return `<div class="cm-item" data-pd-animate>
        <div class="cm-label">${esc(m.label)}</div>
        <div class="cm-pair">
          <span class="cm-side">${esc(t.RESULT || 'result')}</span>
          <span class="cm-track"><span class="cm-fill cm-now" style="--w:${Math.round((m.after / of) * 100)}%"></span></span>
          <span class="cm-num cm-now-num">${esc(fmt(m.after))}</span>
        </div>
        ${m.note ? `<div class="cm-note">${esc(m.note)}</div>` : ''}
      </div>`;
    }

    return `<div class="cm-item cm-flat" data-pd-animate>
      <div class="cm-label">${esc(m.label)}</div>
      <div class="cm-badge">${esc(m.delta || '')}</div>
      ${m.note ? `<div class="cm-note">${esc(m.note)}</div>` : ''}
    </div>`;
  }).join('');
}

/** Widths start at zero so the bars grow; run once the panel is on screen. */
export function animateCaseMetrics(root = document) {
  root.querySelectorAll('.cm-fill').forEach((el, i) => {
    setTimeout(() => { el.style.width = el.style.getPropertyValue('--w'); }, 60 + i * 70);
  });
  root.querySelectorAll('.cm-item[data-pd-animate]').forEach((el, i) => {
    setTimeout(() => el.classList.add('pd-visible'), 40 + i * 60);
  });
}

/** The same comparison as plain text, for the terminal. */
export function renderCaseMetricsAscii(metrics = [], width = 26, t = {}) {
  const out = [];
  for (const m of metrics) {
    const unit = m.unit ? ` ${m.unit}` : '';
    out.push({ text: `  ${m.label}`, cls: 'accent' });
    if (m.before !== undefined && m.after !== undefined) {
      const max = Math.max(m.before, m.after) || 1;
      const bar = (v) => '█'.repeat(Math.max(1, Math.round((v / max) * width)));
      const show = (v, d) => (d || `${formatCompact(v)}${unit}`);
      out.push({ text: `    ${(t.BEFORE || 'before').padEnd(7)}${bar(m.before)} ${show(m.before, m.displayBefore)}`, cls: 'dim' });
      out.push({ text: `    ${(t.AFTER || 'after').padEnd(7)}${bar(m.after)} ${show(m.after, m.displayAfter)}`, cls: 'ok' });
    } else if (m.after !== undefined) {
      const of = m.of || m.after;
      out.push({ text: `    ${'█'.repeat(Math.max(1, Math.round((m.after / of) * width)))} ${formatCompact(m.after)}${unit}`, cls: 'ok' });
    } else if (m.delta) {
      out.push({ text: `    ${m.delta}`, cls: 'ok' });
    }
    if (m.note) out.push({ text: `    ${m.note}`, cls: 'dim' });
  }
  return out;
}

/** Compact stat grid for the desktop-mode About window. */
export function renderStatsForDesktop(stats) {
  return `<div class="wb-stats">${stats
    .map(
      (s) => `<div class="wb-stat">
        <div class="wb-stat-num">${esc(s.display)}</div>
        <div class="wb-stat-label">${esc(s.label)}</div>
        <div class="wb-stat-hint">${esc(s.hint)}</div>
      </div>`,
    )
    .join('')}</div>`;
}

export { categoryColor };
