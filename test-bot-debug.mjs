const TOKEN = '8825772515:AAHFj-czR5tdpAcUzTvFo17-5VjAMpJr8qk';
const API = `https://api.telegram.org/bot${TOKEN}`;
const LOG = 'C:\\Users\\rf24k\\AppData\\Local\\Temp\\bot-debug.log';
import { writeFileSync, appendFileSync } from 'fs';

function log(m) {
  const s = `[${new Date().toISOString().slice(11,19)}] ${m}`;
  appendFileSync(LOG, s + '\n');
  console.log(s);
}

let offset = 0;
log('Bot started');

async function api(method, body) {
  const r = await fetch(`${API}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  return r.json();
}

async function poll() {
  log('poll() start');
  try {
    const d = await api('getUpdates', { offset, timeout: 0 });
    log(`poll() response ok=${d.ok} count=${d.result?.length ?? 0}`);
    if (d.ok && d.result) {
      for (const u of d.result) {
        offset = u.update_id + 1;
        log(`update ${u.update_id}: ${u.message?.text || '(no text)'}`);
        if (u.message?.text) {
          const cmd = u.message.text.trim().split(' ')[0].toLowerCase();
          log(`handle: ${cmd}`);
        }
      }
    }
  } catch (e) {
    log(`poll() error: ${e.message}`);
  }
  log('poll() end');
}

async function loop() {
  log('loop() start');
  await poll();
  log('loop() setTimeout(3000)');
  setTimeout(loop, 3000);
}

log('calling loop()');
loop();
