// Derived statistics.
//
// Every number the site shows about itself is computed here from the content
// in ponytail.config.js / projects.js. Nothing is hand-written twice, so the
// headline figures can never drift away from the project list the way the old
// hardcoded STATS arrays did.
//
// The module has two halves:
//   1. Metric semantics — turning `{ label, value, unit }` highlights into
//      comparable magnitudes, so a chart bar can mean something.
//   2. Aggregates — the headline stats and the per-category project rollups.

import PONYTAIL from '../config/ponytail.config.js';
import { PROJECTS_DETAIL, CAREER_DETAIL } from '../data/projects.js';

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** 1234 -> "1.2K", 4e9 -> "4B", 42 -> "42". Trailing ".0" is dropped. */
export function formatCompact(n, maxFrac = 1) {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  const tiers = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];
  for (const [size, suffix] of tiers) {
    if (abs >= size) {
      const v = n / size;
      return trimZero(v.toFixed(v < 10 ? maxFrac : 0)) + suffix;
    }
  }
  return trimZero(n.toFixed(Number.isInteger(n) ? 0 : maxFrac));
}

function trimZero(s) {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

/** Splits "15+" into { number: 15, prefix: '', suffix: '+' } for counters. */
export function splitDisplay(display) {
  const m = String(display).match(/^([^\d.-]*)(-?[\d.,]+)(.*)$/);
  if (!m) return { prefix: '', number: null, suffix: String(display) };
  return {
    prefix: m[1],
    number: parseFloat(m[2].replace(/,/g, '')),
    suffix: m[3],
  };
}

// ---------------------------------------------------------------------------
// Metric semantics
// ---------------------------------------------------------------------------

const SI = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
const BYTES = { KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15 };

// Seconds covered by a "per X" unit, so every rate can be compared per second.
// `\b` is ASCII-only in JS, so the Cyrillic variants use an explicit
// "not followed by another letter" guard instead.
const NOT_LETTER = '(?![\\p{L}])';
const PERIODS = [
  [new RegExp(`(\\/s${NOT_LETTER}|\\/с${NOT_LETTER}|\\/sec|TPS)`, 'iu'), 1],
  [new RegExp('(\\/min|\\/мин)', 'iu'), 60],
  [new RegExp(`(\\/hr|\\/ч${NOT_LETTER})`, 'iu'), 3600],
  [new RegExp('(\\/day|\\/день)', 'iu'), 86_400],
  [new RegExp(`(\\/mo${NOT_LETTER}|\\/month|\\/мес)`, 'iu'), 2_592_000],
];

// Families where a portfolio-wide rank is a fair comparison. Plain counts are
// excluded: ranking "14 regions" against "100K downloads" would be noise, so
// those bars are presented as an order-of-magnitude reading instead.
const RANKABLE = new Set(['rate', 'data-rate', 'duration', 'money', 'data']);

// Units whose value is a duration — for these, smaller is better.
// Same `\b` caveat as PERIODS: it would never match after a Cyrillic letter,
// which silently classified the Russian "ч" / "мин" / "с" units as plain counts
// and gave the two locales different comparison sets.
const SHORTER_IS_BETTER = new RegExp(`^(ms|sec|min|мин|hr|ч|s|с)${NOT_LETTER}|^(ms|с)\\/`, 'iu');
// Units that measure a span of retained time — for these, longer is better.
const LONGER_IS_BETTER = new RegExp(`^(yrs?|лет|года?|day|days|дн|mo${NOT_LETTER}|мес)`, 'iu');

// The handful of labels where the unit alone gets the direction wrong.
// "Previous Time: 48hr" is a before-figure: a bigger number is a better story.
const DIRECTION_OVERRIDES = [
  [/previous time|предыдущ|было|baseline/i, 'up'],
  [/reduction|reduced|saved|savings|сэкономлено|экономия|сокращ/i, 'up'],
  [/downtime|простой/i, 'down'],
  // Storage capacity is better when larger; a shipped bundle is not.
  [/bundle|бандл|payload/i, 'down'],
  // "Config Drift: 0" is better small. "Drift Checks: 1/day" and
  // "Drift Corrected: 100%" are better large — so match the amount of drift,
  // not every label containing the word.
  [/config drift|дрифт конфигурации/i, 'down'],
  [/manual|ручн|error|ошибок|lag|отставание|breaking|ломающ/i, 'down'],
];

/**
 * Classifies a highlight into something comparable.
 *
 * Returns `kind: 'number' | 'bool' | 'text'`. Only `number` carries a
 * `magnitude` (value scaled into a base unit) and a comparison `family`.
 */
export function parseMetric(h) {
  const unit = (h.unit || '').trim();
  const label = h.label || '';
  const display = h.unit ? `${h.value}${/^[%+x]/.test(unit) ? '' : ' '}${unit}` : `${h.value}`;

  if (h.value === true || h.value === false) {
    return { kind: 'bool', label, raw: h.value, display: h.value ? '✓' : '—' };
  }
  if (typeof h.value !== 'number') {
    return { kind: 'text', label, raw: h.value, display: String(h.value) };
  }

  let family = 'count';
  let mult = 1;
  let per = null;
  let direction = 'up';

  if (unit.includes('%')) {
    family = 'percent';
  } else {
    const bytes = unit.match(/^(KB|MB|GB|TB|PB)/);
    if (bytes) {
      mult = BYTES[bytes[1]];
      family = 'data';
    } else {
      const si = unit.match(/\$?([KMBT])(?![a-zA-Zа-яА-Я])/);
      if (si) mult = SI[si[1]];
      if (unit.includes('$')) family = 'money';
    }

    if (SHORTER_IS_BETTER.test(unit)) {
      family = 'duration';
      direction = 'down';
      mult = durationSeconds(unit);
    } else if (LONGER_IS_BETTER.test(unit)) {
      family = 'duration';
      direction = 'up';
      mult = durationSeconds(unit);
    } else {
      // The period marker often lives in the label rather than the unit
      // ("Peak TPS: 50 K", "Requests/Day: 100 M+"), so search both.
      const haystack = `${unit} ${label}`;
      for (const [re, seconds] of PERIODS) {
        if (re.test(haystack)) {
          per = seconds;
          family = family === 'data' ? 'data-rate' : 'rate';
          break;
        }
      }
    }
  }

  for (const [re, dir] of DIRECTION_OVERRIDES) {
    if (re.test(label)) {
      direction = dir;
      break;
    }
  }

  const magnitude = (h.value * mult) / (per || 1);

  return { kind: 'number', label, raw: h.value, unit, display, family, magnitude, direction };
}

function durationSeconds(unit) {
  const u = unit.toLowerCase();
  if (/^ms/.test(u)) return 1e-3;
  if (/^(min|мин)/.test(u)) return 60;
  if (/^(hr|ч)/.test(u)) return 3600;
  if (/^(day|дн)/.test(u)) return 86_400;
  if (/^(mo|мес)/.test(u)) return 2_592_000;
  if (/^(yr|лет|год)/.test(u)) return 31_536_000;
  return 1; // seconds
}

/**
 * Builds portfolio-wide min/max per comparison family, so an individual
 * metric can be positioned against its peers instead of against an
 * arbitrary 0–100 scale.
 */
export function buildMetricScale(lang) {
  const byFamily = new Map();
  const sources = [
    ...Object.values(PROJECTS_DETAIL[lang] || PROJECTS_DETAIL.EN),
    ...(CAREER_DETAIL[lang] || CAREER_DETAIL.EN),
  ];

  for (const project of sources) {
    for (const h of project.highlights || []) {
      const m = parseMetric(h);
      if (m.kind !== 'number' || m.family === 'percent' || m.magnitude <= 0) continue;
      if (!byFamily.has(m.family)) byFamily.set(m.family, []);
      byFamily.get(m.family).push(m.magnitude);
    }
  }

  const scale = new Map();
  for (const [family, values] of byFamily) {
    values.sort((a, b) => a - b);
    scale.set(family, { min: values[0], max: values[values.length - 1], values });
  }
  return scale;
}

/**
 * Positions a metric on a 0–1 "goodness" axis.
 *
 * Percentages are their own scale (they already have a denominator).
 * Everything else is placed on a log scale between the smallest and largest
 * value of the same family anywhere in the portfolio, then flipped when
 * smaller is better — so a short bar always means "worse" and a full bar
 * always means "best in portfolio", whichever direction the metric runs.
 */
export function scoreMetric(metric, scale) {
  if (metric.kind !== 'number') return null;

  if (metric.family === 'percent') {
    const pct = Math.max(0, Math.min(100, metric.raw));
    return { fill: pct / 100, basis: 'percent', rank: null, peers: null, direction: 'up' };
  }

  const band = scale.get(metric.family);
  if (!band || metric.magnitude <= 0) return null;

  const lo = Math.log10(band.min);
  const hi = Math.log10(band.max);
  const t = hi > lo ? (Math.log10(metric.magnitude) - lo) / (hi - lo) : 1;
  const clamped = Math.max(0, Math.min(1, t));
  const fill = metric.direction === 'down' ? 1 - clamped : clamped;

  // Rank from the good end: 1 = best in portfolio for this family.
  let rank = null;
  if (RANKABLE.has(metric.family)) {
    const sorted = metric.direction === 'down' ? band.values : [...band.values].reverse();
    rank = sorted.findIndex((v) => v === metric.magnitude) + 1 || null;
  }

  return {
    // Keep a visible sliver so a bar never reads as "no data".
    fill: Math.max(0.06, fill),
    basis: metric.family,
    rank,
    peers: rank ? band.values.length : null,
    direction: metric.direction,
  };
}

// ---------------------------------------------------------------------------
// Headline stats
// ---------------------------------------------------------------------------

const CATEGORY_COLORS = {
  Fintech: '#e95420',
  'ML/AI': '#00aa33',
  Infrastructure: '#326ce5',
  'Developer Tooling': '#8b5cf6',
  Web3: '#ec4899',
  Platform: '#14b8a6',
};

export function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#888';
}

function parsePeriod(period) {
  const years = String(period).match(/\d{4}/g) || [];
  const from = years[0] ? Number(years[0]) : null;
  const to = years[1] ? Number(years[1]) : from;
  return { from, to };
}

/** Splits "Go, Temporal, Postgres" into trimmed technology names. */
function techOf(project) {
  return String(project.stack || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function professionalStartYear(career) {
  const years = career
    .filter((c) => c.kind !== 'education')
    .map((c) => parsePeriod(c.period).from)
    .filter(Boolean);
  return years.length ? Math.min(...years) : null;
}

/** Frequency of every technology across the project list, most used first. */
export function techFrequency(projects) {
  const counts = new Map();
  for (const p of projects) {
    for (const t of techOf(p)) counts.set(t, (counts.get(t) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

/**
 * Project count per category, in the order the categories are declared.
 * `labels` carries the translated names — the raw category ids are English
 * keys and were leaking into the Russian breakdown.
 */
export function categoryDistribution(projects, categories, labels = []) {
  return categories
    .map((cat, i) => ({
      label: labels[i] || cat,
      value: projects.filter((p) => p.cat === cat).length,
      color: categoryColor(cat),
    }))
    .filter((d) => d.value > 0);
}

// Percentages where a higher number is unambiguously the better outcome.
// Excludes things like "35% saved", which are real but not comparable to an
// availability target on the same axis.
const QUALITY_PERCENT = /uptime|availability|reproducib|coverage|hit rate|hit ratio|offload|automated|аптайм|доступност|воспроизводим|покрыт|попадан|разгрузка|автоматизирован/i;
// The headline figure must be an availability number specifically. Taking the
// maximum of the whole quality set once produced "Availability Target: 100%"
// off a reproducibility metric, which overclaims.
const AVAILABILITY_ONLY = /uptime|availability|аптайм|доступност/i;

/**
 * Best availability-style percentage across the portfolio, plus every
 * comparable quality percentage for the breakdown.
 *
 * This replaced a "peak throughput" headline. Throughput is the right lead
 * figure for a data-platform CV; for infrastructure and delivery work the
 * number a client actually cares about is whether the thing stays up.
 */
function qualityPercentages(lang) {
  const detail = PROJECTS_DETAIL[lang] || PROJECTS_DETAIL.EN;
  const locale = PONYTAIL.LOCALE[lang] || PONYTAIL.LOCALE.EN;
  const nameOf = (id) => locale.PROJECTS.find((p) => p.id === id)?.name || id;

  const rows = [];
  for (const [id, project] of Object.entries(detail)) {
    for (const h of project.highlights || []) {
      const m = parseMetric(h);
      if (m.kind !== 'number' || m.family !== 'percent') continue;
      if (!QUALITY_PERCENT.test(m.label)) continue;
      rows.push({ id, label: nameOf(id), metric: m.label, value: m.raw, display: m.display });
    }
  }
  return rows.sort((a, b) => b.value - a.value);
}

/**
 * Shipped capabilities per project.
 *
 * This replaced a GitHub star tally. Every repository here is private, so a
 * star count could not be real — and inventing one fabricates a public record
 * anyone can check in seconds.
 */
function capabilitiesByProject(lang, projects) {
  const detail = PROJECTS_DETAIL[lang] || PROJECTS_DETAIL.EN;
  return projects
    .map((p) => ({ id: p.id, label: p.name, value: detail[p.id]?.features?.length || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * The six headline figures. Each carries a `breakdown` the UI can expand —
 * that is what turns the block from a row of numbers into something a visitor
 * can actually interrogate.
 */
export function computeStats(lang) {
  const locale = PONYTAIL.LOCALE[lang] || PONYTAIL.LOCALE.EN;
  const t = locale.STATS_LABELS || {};
  const projects = locale.PROJECTS;
  const career = locale.CAREER;
  const categories = PONYTAIL.CATEGORIES;
  const detail = PROJECTS_DETAIL[lang] || PROJECTS_DETAIL.EN;

  // 1. Years in production — measured, not typed in.
  const startYear = professionalStartYear(career);
  const years = startYear ? new Date().getFullYear() - startYear : 0;
  // Cumulative experience at the end of each role. Plotting each role's own
  // duration produced five identical bars (every stint is three years), which
  // reads as a broken chart; the running total actually shows the career.
  let cumulative = 0;
  const roleSpans = career
    .filter((c) => c.kind !== 'education')
    .slice()
    .reverse()
    .map((c) => {
      const { from, to } = parsePeriod(c.period);
      cumulative += Math.max(1, (to || from) - from);
      return { label: c.company, value: cumulative, meta: c.period };
    });

  // 2. Projects shipped. CATEGORY_LABELS starts with "All", so drop that entry
  // to line the translations up with PONYTAIL.CATEGORIES.
  const byCategory = categoryDistribution(projects, categories, (locale.CATEGORY_LABELS || []).slice(1));

  // 3. Technologies in production.
  const tech = techFrequency(projects);

  // 4. Capabilities shipped across all systems.
  const capabilities = capabilitiesByProject(lang, projects);
  const totalCapabilities = capabilities.reduce((sum, r) => sum + r.value, 0);

  // 5. Availability and quality percentages.
  const quality = qualityPercentages(lang);
  const best = quality.find((r) => AVAILABILITY_ONLY.test(r.metric)) || quality[0];
  const qualityItems = quality.slice(0, 8).map((r) => ({
    label: r.metric,
    value: r.value,
    meta: r.display,
  }));

  // 6. Milestones.
  const milestones = locale.ACHIEVEMENTS;
  const byYear = milestones
    .map((a) => ({ label: a.year, value: 1 }))
    .reduce((acc, cur) => {
      const found = acc.find((x) => x.label === cur.label);
      if (found) found.value += 1;
      else acc.push(cur);
      return acc;
    }, [])
    .sort((a, b) => Number(a.label) - Number(b.label));

  return [
    {
      id: 'experience',
      display: `${years}+`,
      label: t.EXPERIENCE || 'Years in Production',
      hint: (t.EXPERIENCE_HINT || 'Since {year}').replace('{year}', startYear),
      breakdown: { type: 'bar', unit: t.UNIT_YEARS || 'yrs', items: roleSpans },
    },
    {
      id: 'projects',
      display: String(projects.length),
      label: t.PROJECTS || 'Projects Shipped',
      hint: (t.PROJECTS_HINT || 'Across {n} domains').replace('{n}', byCategory.length),
      breakdown: { type: 'bar', items: byCategory },
    },
    {
      id: 'stack',
      display: String(tech.length),
      label: t.STACK || 'Technologies in Production',
      hint: (t.STACK_HINT || 'Most used: {top}').replace('{top}', tech[0]?.label || '—'),
      breakdown: { type: 'bar', unit: t.UNIT_PROJECTS || 'projects', items: tech.slice(0, 8) },
    },
    {
      id: 'capabilities',
      display: String(totalCapabilities),
      label: t.CAPABILITIES || 'Capabilities Shipped',
      hint: (t.CAPABILITIES_HINT || 'Across {n} systems').replace('{n}', capabilities.length),
      breakdown: { type: 'bar', items: capabilities.slice(0, 8) },
    },
    {
      id: 'availability',
      display: best ? best.display : '—',
      label: t.AVAILABILITY || 'Availability Target',
      hint: (t.AVAILABILITY_HINT || 'Best of {n} tracked quality metrics').replace('{n}', quality.length),
      breakdown: { type: 'bar', unit: '%', items: qualityItems },
    },
    {
      id: 'milestones',
      display: String(milestones.length),
      label: t.MILESTONES || 'Milestones & Recognition',
      hint: (t.MILESTONES_HINT || 'From {from} to {to}')
        .replace('{from}', byYear[0]?.label || '')
        .replace('{to}', byYear[byYear.length - 1]?.label || ''),
      breakdown: { type: 'bar', items: byYear },
    },
  ];
}

// ---------------------------------------------------------------------------
// Project rollups (dashboard above the grid)
// ---------------------------------------------------------------------------

/**
 * Aggregates for the currently visible project set. Recomputed whenever the
 * category filter changes, so the dashboard always describes what is on screen.
 */
export function computeProjectAggregates(lang, visibleProjects) {
  const detail = PROJECTS_DETAIL[lang] || PROJECTS_DETAIL.EN;
  const tech = techFrequency(visibleProjects);
  const withRepo = visibleProjects.filter((p) => detail[p.id]?.access === 'private').length;

  let features = 0;
  for (const p of visibleProjects) features += detail[p.id]?.features?.length || 0;

  return {
    count: visibleProjects.length,
    tech,
    uniqueTech: tech.length,
    withRepo,
    features,
    categories: [...new Set(visibleProjects.map((p) => p.cat))],
  };
}

/**
 * Sort key for the project grid. `scale` ranks by the largest comparable
 * magnitude in a project's highlights, so "biggest systems first" is a real
 * ordering rather than an alphabetical one.
 */
export function projectSortValue(lang, project, mode) {
  const d = (PROJECTS_DETAIL[lang] || PROJECTS_DETAIL.EN)[project.id];
  if (!d) return 0;
  if (mode === 'stack') return techOf(project).length;
  if (mode === 'features') return d.features?.length || 0;
  let best = 0;
  for (const h of d.highlights || []) {
    const m = parseMetric(h);
    if (m.kind === 'number' && m.family !== 'percent' && m.magnitude > best) best = m.magnitude;
  }
  return best;
}
