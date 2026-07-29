// Interactive shell for terminal mode.
//
// The original terminal mode printed commands as decoration — `cat /etc/profile`
// followed by its output, with nothing to type into. This makes them real: the
// whole portfolio is driven from the prompt.
//
// Rendering only. What each command *says* lives in commands.js.

import PONYTAIL from '../../config/ponytail.config.js';
import { setMode } from '../themeManager.js';
import { findCommand, commandNames, completionsFor } from './commands.js';
import { validateForm } from '../../lib/validation.js';

const HISTORY_KEY = 'terminal-history';
const MAX_HISTORY = 60;

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.hasAttribute('data-reduced-motion');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

let state = null;      // app state module (for lang)
let booted = false;

const shell = {
  log: null, input: null, mirror: null, inputLine: null, body: null, hints: null,
  history: [],
  historyIndex: -1,
  draft: '',
  transmit: null,      // { step, data } while the contact flow is running
};

const T = () => (PONYTAIL.LOCALE[lang()] || PONYTAIL.LOCALE.EN).TERMINAL || {};
const lang = () => state?.lang || 'EN';

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function lineEl(line) {
  const el = document.createElement('div');
  if (typeof line === 'string') {
    el.className = 'tsh-line';
    el.textContent = line;
    return el;
  }
  el.className = `tsh-line tsh-${line.cls || 'row'}`;
  el.textContent = line.text;
  // Rows that map to a command become clickable, so details are reachable by
  // pointer as well as by typing — the command is still shown, so nobody has to
  // guess it.
  if (line.run) {
    el.classList.add('tsh-runnable');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.dataset.run = line.run;
  }
  return el;
}

/** Appends lines to the scrollback, staggered so it reads like output. */
function print(lines, { instant = false } = {}) {
  if (!lines || !lines.length) return Promise.resolve();
  const fast = instant || reduced() || lines.length > 40;
  return new Promise((resolve) => {
    let i = 0;
    const step = () => {
      const chunk = fast ? lines.length : Math.min(i + 2, lines.length);
      for (; i < chunk; i++) shell.log.appendChild(lineEl(lines[i]));
      scrollToEnd();
      if (i < lines.length) setTimeout(step, 14);
      else resolve();
    };
    step();
  });
}

function printPrompt(command) {
  const el = document.createElement('div');
  el.className = 'tsh-line tsh-echo';
  el.innerHTML = `<span class="tsh-prompt">${esc(promptText())}</span> ${esc(command)}`;
  shell.log.appendChild(el);
  scrollToEnd();
}

function scrollToEnd() {
  shell.body.scrollTop = shell.body.scrollHeight;
}

function clearScreen() {
  shell.log.innerHTML = '';
}

function promptText() {
  return shell.transmit ? (T().TRANSMIT_PROMPT || 'transmit>') : 'visitor@portfolio:~$';
}

function syncPrompt() {
  shell.inputLine.querySelector('.tsh-prompt').textContent = promptText();
}

// ---------------------------------------------------------------------------
// Contact flow
// ---------------------------------------------------------------------------

const TRANSMIT_STEPS = ['name', 'email', 'message'];

function transmitAsk() {
  const t = T();
  const field = TRANSMIT_STEPS[shell.transmit.step];
  const labels = { name: t.ASK_NAME, email: t.ASK_EMAIL, message: t.ASK_MESSAGE };
  print([{ text: `  ${labels[field] || field}`, cls: 'accent' }], { instant: true });
  syncPrompt();
}

async function transmitAccept(value) {
  const t = T();
  const field = TRANSMIT_STEPS[shell.transmit.step];
  shell.transmit.data[field] = value;

  // Validate the field as soon as it is entered rather than at the end.
  const probe = { name: 'xx', email: 'a@b.co', message: '0123456789', ...shell.transmit.data };
  const { errors } = validateForm(probe);
  if (errors[field]) {
    const messages = (PONYTAIL.LOCALE[lang()] || PONYTAIL.LOCALE.EN).FORM_ERRORS || {};
    const key = `${field}_${errors[field]}`.toUpperCase();
    await print([{ text: `  ✗ ${messages[key] || errors[field]}`, cls: 'err' }], { instant: true });
    delete shell.transmit.data[field];
    transmitAsk();
    return;
  }

  shell.transmit.step += 1;
  if (shell.transmit.step < TRANSMIT_STEPS.length) { transmitAsk(); return; }

  const payload = shell.transmit.data;
  shell.transmit = null;
  syncPrompt();

  await print([{ text: `  ${t.SENDING || 'Transmitting…'}`, cls: 'dim' }], { instant: true });
  try {
    const res = await fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Locale': lang() },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
    });
    if (!res.ok) {
      // The endpoint says whether the message went anywhere and where to write
      // instead. "HTTP 503" alone tells the visitor nothing they can act on.
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.message || `HTTP ${res.status}`);
      err.recipient = body.recipient;
      throw err;
    }
    await print([
      { text: `  ${t.SENT || 'TRANSMISSION SENT (200 OK)'}`, cls: 'ok' },
      { text: `  ${(PONYTAIL.LOCALE[lang()] || PONYTAIL.LOCALE.EN).FORM.SUCCESS}`, cls: 'dim' },
    ]);
  } catch (err) {
    await print([
      { text: `  ${(t.SEND_FAIL || 'TRANSMISSION FAILED ({e})').replace('{e}', err.message)}`, cls: 'err' },
      {
        text: `  ${(t.SEND_FALLBACK || 'Mail directly: {mail}').replace('{mail}', err.recipient || 'RF24KRSK@gmail.com')}`,
        cls: 'dim',
      },
    ]);
  }
}

function transmitAbort() {
  shell.transmit = null;
  syncPrompt();
  print([{ text: `  ${T().TRANSMIT_ABORTED || '^C aborted.'}`, cls: 'warn' }], { instant: true });
}

// ---------------------------------------------------------------------------
// Command execution
// ---------------------------------------------------------------------------

/**
 * Character columns that fit the current window.
 *
 * Command output is monospace and was laid out for a desktop-width terminal,
 * so on a phone every line ran past the edge and the body had to pan sideways —
 * the width felt unfixed. Commands now size their columns, bars and wrapping to
 * whatever actually fits.
 */
function columns() {
  const probe = document.createElement('div');
  // Must carry .tsh-line: output lines are a smaller size than the log itself
  // on mobile, and measuring the wrong one over-estimated the character width.
  probe.className = 'tsh-line';
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  probe.textContent = '0'.repeat(50);
  shell.log.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 50;
  probe.remove();
  const styles = getComputedStyle(shell.body);
  const avail = shell.body.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  if (!charWidth) return 72;
  return Math.max(28, Math.min(78, Math.floor(avail / charWidth)));
}

function context() {
  return {
    lang: lang(),
    cols: columns(),
    history: shell.history,
    clear: clearScreen,
    setLang(l) {
      if (state) state.lang = l;
      document.dispatchEvent(new CustomEvent('locale:change', { detail: { lang: l } }));
    },
    setMode(m) { setTimeout(() => setMode(m), 350); },
    startTransmit() {
      shell.transmit = { step: 0, data: {} };
      setTimeout(transmitAsk, 60);
    },
  };
}

async function execute(raw) {
  const input = raw.trim();
  if (!input) return;

  const [name, ...args] = input.split(/\s+/);
  const cmd = findCommand(name);
  if (!cmd) {
    const t = T();
    await print([
      { text: `  ${(t.NOT_FOUND || 'command not found: {c}').replace('{c}', name)}`, cls: 'err' },
      { text: `  ${t.HINT_HELP || 'Type `help` for the list.'}`, cls: 'dim' },
    ], { instant: true });
    return;
  }
  let out = [];
  try {
    out = cmd.run(context(), args) || [];
  } catch (err) {
    out = [{ text: `  ${err.message}`, cls: 'err' }];
  }
  await print(out);
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

function setInput(value) {
  shell.input.value = value;
  shell.mirror.textContent = value;
}

function pushHistory(cmd) {
  if (shell.history[shell.history.length - 1] !== cmd) shell.history.push(cmd);
  if (shell.history.length > MAX_HISTORY) shell.history.shift();
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(shell.history)); } catch { /* private mode */ }
  shell.historyIndex = -1;
}

function completeTab() {
  const value = shell.input.value;
  const parts = value.split(/\s+/);
  const isFirst = parts.length === 1;
  const partial = parts[parts.length - 1] || '';
  const pool = isFirst ? commandNames() : completionsFor(parts[0], context());
  const matches = pool.filter((c) => c.startsWith(partial));

  if (!matches.length) return;
  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0];
    setInput(parts.join(' ') + ' ');
    return;
  }
  // Common prefix first, then show the options.
  let prefix = matches[0];
  for (const m of matches) while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
  if (prefix.length > partial.length) {
    parts[parts.length - 1] = prefix;
    setInput(parts.join(' '));
  }
  printPrompt(value);
  print([{ text: '  ' + matches.join('   '), cls: 'dim' }], { instant: true });
}

async function onKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const value = shell.input.value;
    printPrompt(value);
    setInput('');
    if (shell.transmit) { await transmitAccept(value.trim()); return; }
    if (value.trim()) pushHistory(value.trim());
    await execute(value);
    return;
  }
  if (e.key === 'Tab') { e.preventDefault(); if (!shell.transmit) completeTab(); return; }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (!shell.history.length) return;
    if (shell.historyIndex === -1) { shell.draft = shell.input.value; shell.historyIndex = shell.history.length; }
    shell.historyIndex = Math.max(0, shell.historyIndex - 1);
    setInput(shell.history[shell.historyIndex]);
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (shell.historyIndex === -1) return;
    shell.historyIndex += 1;
    if (shell.historyIndex >= shell.history.length) { shell.historyIndex = -1; setInput(shell.draft); }
    else setInput(shell.history[shell.historyIndex]);
    return;
  }
  if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); clearScreen(); return; }
  if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
    if (window.getSelection()?.toString()) return; // let copy work
    e.preventDefault();
    printPrompt(shell.input.value + '^C');
    setInput('');
    if (shell.transmit) transmitAbort();
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function bootLines() {
  const t = T();
  const l = PONYTAIL.LOCALE[lang()] || PONYTAIL.LOCALE.EN;
  const ua = navigator.userAgent;
  const browser = /Firefox/.test(ua) ? 'Firefox' : /Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Unknown';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown';
  const ok = (s) => ({ text: `[  OK  ] ${s}`, cls: 'ok' });

  return [
    { text: '   █████╗  ██████╗ ', cls: 'logo' },
    { text: '  ██╔══██╗██╔════╝ ', cls: 'logo' },
    { text: '  ███████║██║  ███╗', cls: 'logo' },
    { text: '  ██╔══██║██║   ██║', cls: 'logo' },
    { text: '  ██║  ██║╚██████╔╝', cls: 'logo' },
    { text: '  ╚═╝  ╚═╝ ╚═════╝ ', cls: 'logo' },
    '',
    { text: t.ACCESS || 'ACCESS GRANTED', cls: 'accent' },
    { text: '─'.repeat(Math.min(46, columns())), cls: 'head' },
    ok(`${t.BOOT_CLIENT || 'Client'}: ${browser} / ${os}`),
    ok(`${t.BOOT_SESSION || 'Session'}: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`),
    ok(`${t.BOOT_TARGET || 'Target'}: ${l.ROLE}`),
    { text: `[ INFO ] ${t.BOOT_SHELL || 'Shell'}: portfolio-sh 1.0`, cls: 'dim' },
    { text: '─'.repeat(Math.min(46, columns())), cls: 'head' },
    '',
    { text: t.WELCOME || 'Type `help` to see what this thing does.', cls: 'accent' },
    '',
  ];
}

const CHIPS = ['help', 'whoami', 'stats', 'career', 'projects', 'stack', 'achievements', 'contact', 'neofetch', 'clear'];

function renderChips() {
  shell.hints.innerHTML = CHIPS
    .map((c) => `<button type="button" class="tsh-chip" data-cmd="${esc(c)}">${esc(c)}</button>`)
    .join('');
}

function buildDom(root) {
  root.innerHTML = `
    <div class="tsh-window">
      <div class="tsh-titlebar">
        <span class="tsh-dots"><i></i><i></i><i></i></span>
        <span class="tsh-title">visitor@portfolio: ~</span>
        <span class="tsh-clock" id="tshClock"></span>
        <!-- Real children of the title bar rather than the floating #ui-overlay,
             which sits under this fixed window and left no way out of the mode
             except the mode command. Both reuse the existing delegated
             handlers via their class / data attribute. -->
        <button type="button" class="lang-toggle tsh-ctl" data-lang-switch></button>
        <button type="button" class="settings-gear tsh-ctl" title="Settings" aria-label="Open settings">⚙</button>
      </div>
      <div class="tsh-body" id="tshBody">
        <div class="tsh-log" id="tshLog" role="log" aria-live="polite" aria-atomic="false"></div>
        <div class="tsh-inputline" id="tshInputLine">
          <span class="tsh-prompt">visitor@portfolio:~$</span>
          <span class="tsh-field">
            <span class="tsh-mirror" id="tshMirror"></span><span class="tsh-caret"></span>
            <input id="tshInput" type="text" autocomplete="off" autocapitalize="off"
                   autocorrect="off" spellcheck="false" aria-label="Terminal input" />
          </span>
        </div>
      </div>
      <div class="tsh-hints" id="tshHints"></div>
    </div>`;

  shell.body = root.querySelector('#tshBody');
  shell.log = root.querySelector('#tshLog');
  shell.input = root.querySelector('#tshInput');
  shell.mirror = root.querySelector('#tshMirror');
  shell.inputLine = root.querySelector('#tshInputLine');
  shell.hints = root.querySelector('#tshHints');
}

function wire(root) {
  shell.input.addEventListener('input', () => { shell.mirror.textContent = shell.input.value; });
  shell.input.addEventListener('keydown', onKeyDown);

  // Tapping anywhere in the window focuses the prompt — including on mobile,
  // where the real <input> is what opens the on-screen keyboard.
  shell.body.addEventListener('click', async (e) => {
    if (window.getSelection()?.toString()) return;
    const runnable = e.target.closest('[data-run]');
    if (runnable) {
      const cmd = runnable.dataset.run;
      printPrompt(cmd);
      pushHistory(cmd);
      await execute(cmd);
      shell.input.focus();
      return;
    }
    shell.input.focus();
  });

  // Same rows via the keyboard.
  shell.body.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const runnable = e.target.closest('[data-run]');
    if (!runnable) return;
    e.preventDefault();
    const cmd = runnable.dataset.run;
    printPrompt(cmd);
    pushHistory(cmd);
    await execute(cmd);
    shell.input.focus();
  });

  shell.hints.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-cmd]');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    printPrompt(cmd);
    pushHistory(cmd);
    await execute(cmd);
    shell.input.focus();
  });

  trackViewport(root);

  const clock = root.querySelector('#tshClock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick();
  setInterval(tick, 30000);

  // The orchestrator labels the language toggles during init, which happens
  // before this title bar exists — so label ours on creation.
  labelLangToggle();
}

/**
 * Keeps the shell inside the *visual* viewport.
 *
 * The window is `position: fixed; inset: 0`, which tracks the layout viewport.
 * When the on-screen keyboard opens, iOS shrinks only the visual viewport and
 * leaves the layout viewport alone, so the prompt ended up behind the keyboard;
 * Android resizes the layout viewport instead, which nudged the width as the
 * scrollbar came and went. Sizing to visualViewport handles both, and the
 * prompt is scrolled back into view once the keyboard has settled.
 */
function trackViewport(root) {
  const vv = window.visualViewport;
  const win = root.querySelector('.tsh-window');
  if (!vv || !win) return;

  // Applied synchronously: visualViewport events are infrequent, and deferring
  // to requestAnimationFrame means nothing happens while the tab is hidden.
  const apply = () => {
    win.style.height = `${vv.height}px`;
    win.style.width = `${vv.width}px`;
    win.style.transform = `translate(${vv.offsetLeft}px, ${vv.offsetTop}px)`;
    scrollToEnd();
  };

  vv.addEventListener('resize', apply);
  vv.addEventListener('scroll', apply);
  // Focusing the input is what summons the keyboard; the viewport reports its
  // new size a beat later.
  shell.input.addEventListener('focus', () => setTimeout(apply, 250));
  shell.input.addEventListener('blur', () => setTimeout(apply, 250));
  apply();
}

function labelLangToggle() {
  const btn = document.querySelector('.tsh-titlebar [data-lang-switch]');
  if (btn) btn.textContent = lang() === 'EN' ? 'RU / EN' : 'EN / RU';
}

export async function initTerminal(appState) {
  state = appState;
  const root = document.getElementById('terminalShell');
  if (!root) return;

  // Re-init on locale change so the boot banner and hints follow the language.
  if (booted) {
    clearScreen();
    renderChips();
    labelLangToggle();
    syncPrompt();
    await print(bootLines());
    return;
  }
  booted = true;

  buildDom(root);
  wire(root);
  renderChips();

  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (Array.isArray(saved)) shell.history = saved.slice(-MAX_HISTORY);
  } catch { /* ignore */ }

  await print(bootLines());
  shell.input.focus();
}

export function refreshTerminalLocale() {
  if (!booted) return;
  syncPrompt();
  renderChips();
  labelLangToggle();
}
