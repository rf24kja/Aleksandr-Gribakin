// Consult form endpoint.
//
// Runs on Vercel's Edge runtime, so the handler takes a Web `Request` and
// returns a Web `Response`. Vercel passes the Request as the first argument —
// it is NOT wrapped in an object, which is what the previous `POST({ request })`
// signature assumed (that threw on every call).
export const config = { runtime: 'edge' };

// Shown to visitors in the fallback messages, so it keeps the casing used
// everywhere else on the site.
const RECIPIENT = 'RF24KRSK@gmail.com';
// What actually goes to the mail API. Resend's test-mode allowlist compares
// the recipient against the account owner's address as a plain string, so the
// capitalised form was refused as "not your own email address" even though it
// is the same mailbox.
const RECIPIENT_ADDR = RECIPIENT.toLowerCase();
const RATE_WINDOW = 60_000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 2;

// Pasted env values routinely carry a trailing newline or wrapping quotes.
// Either one makes the Authorization header invalid and Resend answers
// 401 "API key is invalid", which reads like a wrong key rather than a
// whitespace problem — so normalise every read.
function env(name) {
  const raw = process.env[name];
  return typeof raw === 'string' ? raw.trim().replace(/^["']|["']$/g, '') : '';
}

// Resend rejects a From address on a domain that is not verified in the
// account. dev24.pro is registered but its DKIM/SPF records are not published
// yet, so the previously hardcoded noreply@dev24.pro would have failed every
// send even with a valid key. resend.dev is Resend's shared sender: it needs
// no DNS and delivers to the account owner's own address, which is exactly who
// RECIPIENT is. Switch MAIL_FROM to noreply@dev24.pro once Resend reports the
// domain verified.
const SENDER = env('MAIL_FROM') || 'onboarding@resend.dev';

// The UI sends X-Locale; answering in English to a Russian visitor is jarring
// when the message is the one thing that tells them what to do next.
const MESSAGES = {
  EN: {
    rate: 'Too many requests. Please try again in a minute.',
    rateEmail: 'Too many requests from this email. Please try again in a minute.',
    badJson: 'Invalid JSON.',
    validation: 'Invalid or incomplete payload.',
    notConfigured: `Mail delivery is not configured. Please write to ${RECIPIENT} directly.`,
    delivery: `Transmission failed. Please write to ${RECIPIENT} directly.`,
    success: 'Message delivered. I will respond within 24 hours.',
  },
  RU: {
    rate: 'Слишком много запросов. Попробуйте через минуту.',
    rateEmail: 'Слишком много запросов с этого адреса. Попробуйте через минуту.',
    badJson: 'Некорректный JSON.',
    validation: 'Данные заполнены не полностью или неверно.',
    notConfigured: `Отправка почты не настроена. Напишите напрямую на ${RECIPIENT}.`,
    delivery: `Отправить не удалось. Напишите напрямую на ${RECIPIENT}.`,
    success: 'Сообщение отправлено. Отвечу в течение 24 часов.',
  },
};

function messages(request) {
  const tag = (request.headers.get('x-locale') || 'EN').trim().slice(0, 2).toUpperCase();
  return MESSAGES[tag] || MESSAGES.EN;
}

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

// What the page collected about where this visitor came from. Whitelisted and
// re-cleaned here rather than trusted: it arrives in the request body like
// everything else, and it ends up in an email that gets read.
const SOURCE_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'yclid', 'gclid', 'fbclid', 'referrer', 'landing',
];

function sourceOf(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const key of SOURCE_KEYS) {
    const value = clean(raw[key], 120);
    if (value) out[key] = value;
  }
  return out;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true only if Telegram actually accepted the message. */
async function notifyTelegram({ name, email, message, source = {} }) {
  const token = env('TELEGRAM_BOT_TOKEN');
  const chatId = env('TELEGRAM_CHAT_ID');
  if (env('TELEGRAM_NOTIFY') !== '1' || !token || !chatId) return false;
  const from = [source.utm_source, source.utm_campaign].filter(Boolean).join(' / ');
  const text = [
    'New consult submission',
    '----------------',
    `Name: ${name}`,
    `Email: ${email}`,
    ...(from ? [`From: ${from}`] : []),
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
  if (env('RESEND_API_KEY')) out.push('email');
  if (env('TELEGRAM_NOTIFY') === '1' && env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHAT_ID')) {
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
  const m = messages(request);

  if (!hit(ipMap, ip, MAX_PER_IP, start)) {
    return json({ error: 'rate_limit', message: m.rate, retryAfter: 60 }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request', message: m.badJson }, 400);
  }

  // Honeypot: pretend success so bots do not learn they were caught.
  if (clean(body._website, 64)) return json({ success: true, message: m.success });

  const name = clean(body.name, 64);
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 2000);

  // Mirrors src/lib/validation.js so client and server agree on what is valid.
  // The recipient is a server-side constant — it is never taken from the body.
  // Consent is checked here too: a client-side tick is a courtesy, not a
  // record, and this endpoint is reachable without the page.
  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10 || !body.consent) {
    return json({ error: 'validation', message: m.validation }, 400);
  }

  if (!hit(emailMap, email, MAX_PER_EMAIL, start)) {
    return json({ error: 'rate_limit', message: m.rateEmail }, 429);
  }

  const source = sourceOf(body.source);
  const sourceLines = Object.entries(source).map(([k, v]) => `  ${k}: ${v}`);

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Message: ${message}`,
    `Locale: ${request.headers.get('x-locale') || 'EN'}`,
    `Timestamp: ${clean(body.timestamp, 40) || new Date().toISOString()}`,
    `IP: ${ip}`,
    ...(sourceLines.length ? ['', 'Source:', ...sourceLines] : []),
    '---',
    `Submitted at: ${new Date().toISOString()}`,
    `Response time: ${Date.now() - start}ms`,
  ].join('\n');

  // The campaign rides in the subject as well, so a mailbox can be filtered and
  // sorted by it without opening anything.
  const campaign = source.utm_campaign || source.utm_source || '';
  const subject = `[Consult] ${name}${campaign ? ` · ${campaign}` : ''}`;

  // Nothing configured means the message goes nowhere. Saying "delivered"
  // anyway loses the lead silently, so fail loudly and let the UI offer the
  // direct address instead.
  const configured = channels();
  if (!configured.length) {
    console.error('[Consult] No delivery channel configured — set RESEND_API_KEY.');
    return json({
      error: 'not_configured',
      message: m.notConfigured,
      recipient: RECIPIENT,
    }, 503);
  }

  let delivered = false;

  const resendKey = env('RESEND_API_KEY');
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: RECIPIENT_ADDR,
          from: SENDER,
          reply_to: email,
          subject,
          text,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        if (res.status === 401) {
          // Distinguish the two things a 401 actually means here, because the
          // API's own wording ("API key is invalid") points at neither.
          // The shape tells them apart without printing the secret: a Resend
          // key is re_ followed by ~30 URL-safe characters, so a short or
          // oddly-shaped value is a truncated or wrong paste, while a
          // well-formed one that still fails has been revoked.
          console.error(
            '[Consult] Resend rejected RESEND_API_KEY. Key shape: '
            + `length=${resendKey.length}, starts_with_re=${resendKey.startsWith('re_')}, `
            + `well_formed=${/^re_[A-Za-z0-9_-]{20,}$/.test(resendKey)}. `
            + 'A malformed shape means the pasted value is truncated or not an API key; '
            + 'a well-formed one that still fails has been revoked — create a new key '
            + 'with sending access and set it for Production.',
          );
        } else if (res.status === 403) {
          console.error(
            `[Consult] Resend refused to send from ${SENDER}. The shared resend.dev sender only `
            + 'delivers to the address that owns the account; any other From needs a verified domain.',
          );
        }
        throw new Error(`Email API: ${res.status} ${detail}`.trim());
      }
      delivered = true;
    } catch (err) {
      console.error(`[Consult] Email delivery failed: ${err.message}`);
      // Telegram may still carry it; only give up if that fails too.
    }
  }

  if (await notifyTelegram({ name, email, message, source })) delivered = true;

  if (!delivered) {
    return json({
      error: 'delivery',
      message: m.delivery,
      recipient: RECIPIENT,
    }, 502);
  }

  return json({ success: true, message: m.success });
}
