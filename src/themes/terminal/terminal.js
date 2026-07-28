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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await print([
      { text: `  ${t.SENT || 'TRANSMISSION SENT (200 OK)'}`, cls: 'ok' },
      { text: `  ${(PONYTAIL.LOCALE[lang()] || PONYTAIL.LOCALE.EN).FORM.SUCCESS}`, cls: 'dim' },
    ]);
  } catch (err) {
    await print([
      { text: `  ${(t.SEND_FAIL || 'TRANSMISSION FAILED ({e})').replace('{e}', err.message)}`, cls: 'err' },
      { text: `  ${t.SEND_FALLBACK || 'Mail directly: RF24KRSK@gmail.com'}`, cls: 'dim' },
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

function context() {
  return {
    lang: lang(),
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
    { text: '─'.repeat(46), cls: 'head' },
    ok(`${t.BOOT_CLIENT || 'Client'}: ${browser} / ${os}`),
    ok(`${t.BOOT_SESSION || 'Session'}: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`),
    ok(`${t.BOOT_TARGET || 'Target'}: ${l.ROLE}`),
    { text: `[ INFO ] ${t.BOOT_SHELL || 'Shell'}: portfolio-sh 1.0`, cls: 'dim' },
    { text: '─'.repeat(46), cls: 'head' },
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
  shell.body.addEventListener('click', () => {
    if (window.getSelection()?.toString()) return;
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

  const clock = root.querySelector('#tshClock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick();
  setInterval(tick, 30000);

  // The orchestrator labels the language toggles during init, which happens
  // before this title bar exists — so label ours on creation.
  labelLangToggle();
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
