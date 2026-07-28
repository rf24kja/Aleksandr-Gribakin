// Command registry for the interactive terminal.
//
// Every command returns an array of output lines. A line is either a string
// (plain text) or `{ text, cls }` where `cls` picks a colour role:
//   accent · warn · dim · err · ok · head · raw(no escaping is ever done —
// all content originates from our own locale, never from user input).
//
// Commands never touch the DOM. The shell in terminal.js renders whatever they
// return, which keeps output testable and makes it trivial to add a command.

import PONYTAIL from '../../config/ponytail.config.js';
import { PROJECTS_DETAIL, CAREER_DETAIL, ACHIEVEMENT_DETAIL } from '../../data/projects.js';
import { computeStats, techFrequency, parseMetric } from '../../lib/stats.js';

const L = (lang) => PONYTAIL.LOCALE[lang] || PONYTAIL.LOCALE.EN;
const T = (lang) => L(lang).TERMINAL || {};

const RULE = '─'.repeat(52);
const head = (title) => [{ text: `─── ${title} ${'─'.repeat(Math.max(3, 48 - title.length))}`, cls: 'head' }];

/** Pads a label so the values line up in a monospace column. */
function pad(s, n) {
  const str = String(s);
  return str.length >= n ? str : str + ' '.repeat(n - str.length);
}

/** Wraps prose to a column width without breaking words. */
function wrap(text, width = 72, indent = '') {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > width) { lines.push(indent + line.trim()); line = w; }
    else line += ' ' + w;
  }
  if (line.trim()) lines.push(indent + line.trim());
  return lines;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const COMMANDS = [
  {
    name: 'help', aliases: ['?', 'commands'], key: 'HELP',
    run(ctx) {
      const t = T(ctx.lang);
      const out = [...head(t.HEAD_HELP || 'AVAILABLE COMMANDS')];
      for (const c of COMMANDS) {
        if (c.hidden) continue;
        const usage = c.usage ? `${c.name} ${c.usage}` : c.name;
        out.push({ text: `  ${pad(usage, 22)}${(t.CMD || {})[c.key] || ''}`, cls: 'cmdrow' });
      }
      out.push('');
      out.push({ text: `  ${t.HINT_KEYS || 'Tab completes · ↑ ↓ history · Ctrl+L clears'}`, cls: 'dim' });
      return out;
    },
  },
  {
    name: 'whoami', key: 'WHOAMI',
    run(ctx) {
      const l = L(ctx.lang);
      return [
        ...head(T(ctx.lang).HEAD_ID || 'IDENTITY'),
        { text: `  ${pad('name', 14)}: ${l.NAME}`, cls: 'kv' },
        { text: `  ${pad('role', 14)}: ${l.ROLE}`, cls: 'kv' },
        { text: `  ${pad('focus', 14)}: ${l.TAGLINE}`, cls: 'kv' },
        { text: `  ${pad('mail', 14)}: RF24KRSK@gmail.com`, cls: 'kv' },
      ];
    },
  },
  {
    name: 'about', aliases: ['motd'], key: 'ABOUT',
    run(ctx) {
      const l = L(ctx.lang);
      return [...head(T(ctx.lang).HEAD_ABOUT || 'ABOUT'), ...wrap(l.BIO, 70, '  ')];
    },
  },
  {
    name: 'stats', aliases: ['profile'], usage: '[--breakdown]', key: 'STATS',
    complete: () => ['--breakdown'],
    run(ctx, args) {
      const stats = computeStats(ctx.lang);
      const full = args.includes('--breakdown') || args.includes('-b');
      const out = [...head(T(ctx.lang).HEAD_STATS || 'SYSTEM PROFILE')];
      for (const s of stats) {
        out.push({ text: `  ${pad(s.label, 30)}: ${s.display}`, cls: 'kv' });
        out.push({ text: `  ${' '.repeat(30)}  ${s.hint}`, cls: 'dim' });
        if (full) {
          const max = Math.max(...s.breakdown.items.map((i) => i.value)) || 1;
          for (const item of s.breakdown.items.slice(0, 8)) {
            const filled = Math.max(1, Math.round((item.value / max) * 22));
            const bar = '█'.repeat(filled) + '░'.repeat(22 - filled);
            const val = item.meta ?? item.value;
            out.push({ text: `      ${pad(item.label, 26)} ${bar} ${val}`, cls: 'bar' });
          }
          out.push('');
        }
      }
      if (!full) out.push({ text: `  ${T(ctx.lang).HINT_BREAKDOWN || 'Run `stats --breakdown` for the detail.'}`, cls: 'dim' });
      return out;
    },
  },
  {
    name: 'career', aliases: ['journalctl'], usage: '[n]', key: 'CAREER',
    complete: (ctx) => L(ctx.lang).CAREER.map((_, i) => String(i + 1)),
    run(ctx, args) {
      const l = L(ctx.lang);
      const t = T(ctx.lang);
      const idx = parseInt(args[0], 10);
      if (!isNaN(idx)) {
        const c = l.CAREER[idx - 1];
        const d = (CAREER_DETAIL[ctx.lang] || CAREER_DETAIL.EN)[idx - 1];
        if (!c || !d) return [{ text: `  ${(t.NO_ENTRY || 'No entry {n}.').replace('{n}', idx)}`, cls: 'err' }];
        const out = [...head(`${c.role} @ ${c.company}`.toUpperCase())];
        out.push({ text: `  ${c.period}`, cls: 'accent' }, '');
        for (const p of d.details) { out.push(...wrap(p, 70, '  ')); out.push(''); }
        out.push({ text: `  ${t.LBL_STACK || 'Stack'}: ${d.techStack.join(' · ')}`, cls: 'dim' }, '');
        for (const a of d.keyAchievements) out.push({ text: `  → ${a}`, cls: 'ok' });
        return out;
      }
      const out = [...head(t.HEAD_CAREER || 'CAREER LOG')];
      l.CAREER.forEach((c, i) => {
        out.push({ text: `  [${c.period}]  ${c.role.toUpperCase()}  @ ${c.company}`, cls: 'accent' });
        wrap(c.desc, 66, '  │  ').forEach((x) => out.push({ text: x, cls: 'dim' }));
        out.push({ text: `  │  → ${(t.HINT_DETAIL || 'career {n} for detail').replace('{n}', i + 1)}`, cls: 'hintline' });
        out.push('');
      });
      return out;
    },
  },
  {
    name: 'projects', aliases: ['ls', 'targets'], usage: '[--cat=<name>]', key: 'PROJECTS',
    complete: (ctx) => PONYTAIL.CATEGORIES.map((c) => `--cat=${c}`),
    run(ctx, args) {
      const l = L(ctx.lang);
      const t = T(ctx.lang);
      const catArg = (args.find((a) => a.startsWith('--cat=')) || '').slice(6).toLowerCase();
      let list = l.PROJECTS;
      if (catArg) {
        list = list.filter((p) => p.cat.toLowerCase().includes(catArg));
        if (!list.length) {
          return [
            { text: `  ${(t.NO_CAT || 'No category matching "{c}".').replace('{c}', catArg)}`, cls: 'err' },
            { text: `  ${PONYTAIL.CATEGORIES.join(' · ')}`, cls: 'dim' },
          ];
        }
      }
      const out = [...head(`${t.HEAD_TARGETS || 'TARGETS'} (${list.length})`)];
      for (const p of list) {
        out.push({ text: `  ${pad('[' + p.cat + ']', 18)}${pad(p.id, 20)}· ${p.metric}`, cls: 'row' });
      }
      out.push('');
      out.push({ text: `  ${t.HINT_OPEN || 'open <id> for the full brief'}`, cls: 'dim' });
      return out;
    },
  },
  {
    name: 'open', aliases: ['cat', 'brief'], usage: '<project-id>', key: 'OPEN',
    complete: (ctx) => L(ctx.lang).PROJECTS.map((p) => p.id),
    run(ctx, args) {
      const l = L(ctx.lang);
      const t = T(ctx.lang);
      const id = (args[0] || '').replace(/\/$/, '');
      if (!id) return [{ text: `  ${t.USAGE_OPEN || 'usage: open <project-id>'}`, cls: 'warn' }];
      const p = l.PROJECTS.find((x) => x.id === id);
      const d = (PROJECTS_DETAIL[ctx.lang] || PROJECTS_DETAIL.EN)[id];
      if (!p || !d) {
        return [
          { text: `  ${(t.NO_TARGET || 'No target "{id}".').replace('{id}', id)}`, cls: 'err' },
          { text: `  ${t.HINT_LS || 'Run `projects` to list them.'}`, cls: 'dim' },
        ];
      }
      const out = [...head(p.name.toUpperCase())];
      out.push({ text: `  ${pad(t.LBL_CAT || 'Category', 10)}: ${p.cat} / ${p.tag}`, cls: 'kv' });
      out.push({ text: `  ${pad(t.LBL_STACK || 'Stack', 10)}: ${p.stack}`, cls: 'kv' });
      out.push({ text: `  ${pad(t.LBL_ACCESS || 'Access', 10)}: ${d.access === 'private' ? (l.DETAIL.PRIVATE_REPO || 'Private repository') : 'public'}`, cls: 'warn' });
      out.push('');
      for (const para of d.details) { out.push(...wrap(para, 70, '  ')); out.push(''); }
      out.push({ text: `  ${t.HEAD_METRICS || 'KEY METRICS'}`, cls: 'accent' });
      for (const h of d.highlights) {
        const m = parseMetric(h);
        const dir = m.kind === 'number' ? (m.direction === 'down' ? '↓' : '↑') : ' ';
        out.push({ text: `    ${pad(h.label, 26)} ${pad(m.display, 14)} ${dir}`, cls: 'kv' });
      }
      out.push('');
      out.push({ text: `  ${t.HEAD_FEATURES || 'FEATURES'}`, cls: 'accent' });
      for (const f of d.features) out.push({ text: `    · ${f}`, cls: 'row' });
      out.push('');
      out.push({ text: `  ${l.DETAIL.REFERENCE_NOTE}`, cls: 'dim', wrapText: true });
      return out;
    },
  },
  {
    name: 'stack', aliases: ['tech'], key: 'STACK',
    run(ctx) {
      const l = L(ctx.lang);
      const freq = techFrequency(l.PROJECTS);
      const max = freq[0]?.value || 1;
      const out = [...head((T(ctx.lang).HEAD_STACK || 'TECHNOLOGY') + ` (${freq.length})`)];
      for (const f of freq.slice(0, 18)) {
        const filled = Math.max(1, Math.round((f.value / max) * 20));
        out.push({ text: `  ${pad(f.label, 20)} ${'█'.repeat(filled)}${'░'.repeat(20 - filled)} ${f.value}`, cls: 'bar' });
      }
      return out;
    },
  },
  {
    name: 'achievements', aliases: ['milestones'], usage: '[n]', key: 'ACH',
    complete: (ctx) => L(ctx.lang).ACHIEVEMENTS.map((_, i) => String(i + 1)),
    run(ctx, args) {
      const l = L(ctx.lang);
      const t = T(ctx.lang);
      const idx = parseInt(args[0], 10);
      if (!isNaN(idx)) {
        const a = l.ACHIEVEMENTS[idx - 1];
        const d = (ACHIEVEMENT_DETAIL[ctx.lang] || ACHIEVEMENT_DETAIL.EN)[idx - 1];
        if (!a || !d) return [{ text: `  ${(t.NO_ENTRY || 'No entry {n}.').replace('{n}', idx)}`, cls: 'err' }];
        const out = [...head(a.title.toUpperCase())];
        out.push({ text: `  ${a.year}`, cls: 'accent' }, '');
        for (const p of d.details) { out.push(...wrap(p, 70, '  ')); out.push(''); }
        return out;
      }
      const out = [...head(t.HEAD_MILESTONES || 'MILESTONES')];
      l.ACHIEVEMENTS.forEach((a, i) => {
        out.push({ text: `  ${pad(a.year, 6)}${pad(a.title, 34)}· ${(t.HINT_DETAIL_N || 'achievements {n}').replace('{n}', i + 1)}`, cls: 'row' });
      });
      return out;
    },
  },
  {
    name: 'contact', aliases: ['transmit', 'mail'], key: 'CONTACT',
    run(ctx) {
      const t = T(ctx.lang);
      ctx.startTransmit();
      return [
        ...head(t.HEAD_TRANSMIT || 'TRANSMIT'),
        { text: `  ${t.TRANSMIT_INTRO || 'Direct line. Three questions, then it sends.'}`, cls: 'dim' },
        { text: `  ${t.TRANSMIT_CANCEL || 'Ctrl+C to abort.'}`, cls: 'dim' },
        '',
      ];
    },
  },
  {
    name: 'lang', usage: '<en|ru>', key: 'LANG',
    complete: () => ['en', 'ru'],
    run(ctx, args) {
      const t = T(ctx.lang);
      const want = (args[0] || '').toUpperCase();
      if (want !== 'EN' && want !== 'RU') {
        return [{ text: `  ${(t.LANG_CURRENT || 'Language: {l}. Usage: lang <en|ru>').replace('{l}', ctx.lang)}`, cls: 'warn' }];
      }
      ctx.setLang(want);
      return [{ text: `  ${(t.LANG_SET || 'Language set to {l}.').replace('{l}', want)}`, cls: 'ok' }];
    },
  },
  {
    name: 'mode', usage: '<business|desktop>', key: 'MODE',
    complete: () => ['business', 'desktop'],
    run(ctx, args) {
      const t = T(ctx.lang);
      const m = (args[0] || '').toLowerCase();
      if (!['business', 'desktop'].includes(m)) {
        return [{ text: `  ${t.MODE_USAGE || 'usage: mode <business|desktop>'}`, cls: 'warn' }];
      }
      ctx.setMode(m);
      return [{ text: `  ${(t.MODE_SET || 'Switching to {m}…').replace('{m}', m)}`, cls: 'ok' }];
    },
  },
  {
    name: 'neofetch', key: 'NEOFETCH',
    run(ctx) {
      const l = L(ctx.lang);
      const stats = computeStats(ctx.lang);
      const logo = [
        '   █████╗  ██████╗ ',
        '  ██╔══██╗██╔════╝ ',
        '  ███████║██║  ███╗',
        '  ██╔══██║██║   ██║',
        '  ██║  ██║╚██████╔╝',
        '  ╚═╝  ╚═╝ ╚═════╝ ',
      ];
      const info = [
        `${l.NAME}`,
        '─────────────────────────',
        `${pad('role', 9)}: ${l.ROLE}`,
        `${pad('shell', 9)}: portfolio-sh 1.0`,
        `${pad('mode', 9)}: terminal`,
        `${pad('lang', 9)}: ${ctx.lang}`,
        ...stats.slice(0, 4).map((s) => `${pad(s.id, 9)}: ${s.display} ${s.label.toLowerCase()}`),
      ];
      const out = [];
      const rows = Math.max(logo.length, info.length);
      for (let i = 0; i < rows; i++) {
        out.push({ text: `${pad(logo[i] || '', 22)}${info[i] || ''}`, cls: i === 0 ? 'accent' : 'kv' });
      }
      return out;
    },
  },
  {
    name: 'coffee', key: 'COFFEE',
    run(ctx) {
      const c = L(ctx.lang).COFFEE || {};
      return [
        ...head((c.TITLE || 'COFFEE').replace(/^[^\p{L}]+/u, '').toUpperCase()),
        { text: `  ${c.NETWORK || 'USDT TRC-20'}`, cls: 'dim' },
        { text: '  TWTCH2ZhyKvzZU1ph6h1d4vTHpHyJDkN5i', cls: 'accent' },
      ];
    },
  },
  { name: 'date', hidden: true, run: () => [{ text: '  ' + new Date().toString(), cls: 'kv' }] },
  {
    name: 'pwd', hidden: true,
    run: () => [{ text: '  /home/visitor', cls: 'kv' }],
  },
  {
    name: 'echo', hidden: true,
    run: (_ctx, args) => [{ text: '  ' + args.join(' '), cls: 'kv' }],
  },
  {
    name: 'sudo', hidden: true,
    run: (ctx) => [{ text: `  ${T(ctx.lang).SUDO || 'visitor is not in the sudoers file. This incident has been reported.'}`, cls: 'err' }],
  },
  {
    name: 'history', key: 'HISTORY',
    run(ctx) {
      if (!ctx.history.length) return [{ text: `  ${T(ctx.lang).NO_HISTORY || 'No history yet.'}`, cls: 'dim' }];
      return ctx.history.map((h, i) => ({ text: `  ${pad(i + 1, 5)}${h}`, cls: 'kv' }));
    },
  },
  { name: 'clear', aliases: ['cls'], key: 'CLEAR', run: (ctx) => { ctx.clear(); return []; } },
  {
    name: 'exit', aliases: ['quit', 'logout'], key: 'EXIT',
    run(ctx) {
      ctx.setMode('business');
      return [{ text: `  ${T(ctx.lang).EXIT || 'Session closed. Returning to the standard view…'}`, cls: 'ok' }];
    },
  },
];

const INDEX = new Map();
for (const c of COMMANDS) {
  INDEX.set(c.name, c);
  for (const a of c.aliases || []) INDEX.set(a, c);
}

export function findCommand(name) {
  return INDEX.get(String(name || '').toLowerCase()) || null;
}

/** Every name and alias, for tab completion. */
export function commandNames() {
  return [...INDEX.keys()].sort();
}

/** Argument suggestions for a given command, for tab completion. */
export function completionsFor(name, ctx) {
  const cmd = findCommand(name);
  return cmd?.complete ? cmd.complete(ctx) : [];
}

export { COMMANDS, RULE, wrap };
