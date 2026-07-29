// Consult form endpoint.
//
// Runs on Vercel's Edge runtime, so the handler takes a Web `Request` and
// returns a Web `Response`. Vercel passes the Request as the first argument —
// it is NOT wrapped in an object, which is what the previous `POST({ request })`
// signature assumed (that threw on every call).
export const config = { runtime: 'edge' };

const RECIPIENT = 'RF24KRSK@gmail.com';
const RATE_WINDOW = 60_000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 2;

// Best-effort only. Edge isolates are per-region and short-lived, so this
// catches bursts from a single client but is not a substitute for a shared
// store (KV/Upstash) if abuse becomes a real problem.
const ipMap = new Map();
const emailMap = new Map();

function hit(map, key, limit, now) {
  const times = (map.get(key) || []).filter((t) => now - t < RATE_WINDOW);
  if (times.length >= limit) return false;
  times.push(now);
  map.set(key, times);
  if (map.size > 5000) map.clear(); // crude bound; isolates are ephemeral anyway
  return true;
}

// Control characters only. The old sanitiser stripped & " ' as well, which
// mangled legitimate input like "R&D" or "don't" — and there is nothing to
// escape here, the text goes into a plain-text email body.
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL_CHARS, ' ').trim().slice(0, max);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true only if Telegram actually accepted the message. */
async function notifyTelegram({ name, email, message }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (process.env.TELEGRAM_NOTIFY !== '1' || !token || !chatId) return false;
  const text = [
    'New consult submission',
    '----------------',
    `Name: ${name}`,
    `Email: ${email}`,
    `Message: ${message.slice(0, 400)}`,
  ].join('\n');
  // Direct HTTP call — importing telegram-bot.js here would pull a filesystem
  // polling loop into the serverless function.
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Which delivery channels are actually configured on this deployment. */
function channels() {
  const out = [];
  if (process.env.RESEND_API_KEY) out.push('email');
  if (process.env.TELEGRAM_NOTIFY === '1' && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    out.push('telegram');
  }
  return out;
}

export default async function handler(request) {
  // Reports configuration, never secrets — so it can be checked from outside
  // whether a submitted form would actually reach anyone.
  if (request.method === 'GET') {
    const configured = channels();
    return json({ status: 'ok', delivery: configured.length ? configured : 'none' });
  }
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const start = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!hit(ipMap, ip, MAX_PER_IP, start)) {
    return json({ error: 'rate_limit', message: 'Too many requests.', retryAfter: 60 }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request', message: 'Invalid JSON' }, 400);
  }

  // Honeypot: pretend success so bots do not learn they were caught.
  if (clean(body._website, 64)) return json({ success: true, message: 'Message delivered.' });

  const name = clean(body.name, 64);
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 2000);

  // Mirrors src/lib/validation.js so client and server agree on what is valid.
  // The recipient is a server-side constant — it is never taken from the body.
  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
    return json({ error: 'validation', message: 'Invalid or incomplete payload.' }, 400);
  }

  if (!hit(emailMap, email, MAX_PER_EMAIL, start)) {
    return json({ error: 'rate_limit', message: 'Too many requests from this email.' }, 429);
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Message: ${message}`,
    `Locale: ${request.headers.get('x-locale') || 'EN'}`,
    `Timestamp: ${clean(body.timestamp, 40) || new Date().toISOString()}`,
    `IP: ${ip}`,
    '---',
    `Submitted at: ${new Date().toISOString()}`,
    `Response time: ${Date.now() - start}ms`,
  ].join('\n');

  // Nothing configured means the message goes nowhere. Saying "delivered"
  // anyway loses the lead silently, so fail loudly and let the UI offer the
  // direct address instead.
  const configured = channels();
  if (!configured.length) {
    console.error('[Consult] No delivery channel configured — set RESEND_API_KEY.');
    return json({
      error: 'not_configured',
      message: `Mail delivery is not configured. Please write to ${RECIPIENT} directly.`,
      recipient: RECIPIENT,
    }, 503);
  }

  let delivered = false;

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: RECIPIENT,
          from: 'noreply@dev24.pro',
          reply_to: email,
          subject: `[Consult] ${name}`,
          text,
        }),
      });
      if (!res.ok) throw new Error(`Email API: ${res.status} ${await res.text().catch(() => '')}`.trim());
      delivered = true;
    } catch (err) {
      console.error(`[Consult] Email delivery failed: ${err.message}`);
      // Telegram may still carry it; only give up if that fails too.
    }
  }

  if (await notifyTelegram({ name, email, message })) delivered = true;

  if (!delivered) {
    return json({
      error: 'delivery',
      message: `Transmission failed. Please write to ${RECIPIENT} directly.`,
      recipient: RECIPIENT,
    }, 502);
  }

  return json({ success: true, message: 'Message delivered. I will respond within 24 hours.' });
}
