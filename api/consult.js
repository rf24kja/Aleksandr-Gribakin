const RATE_WINDOW = 60_000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 2;
const ipMap = new Map();
const emailMap = new Map();

setInterval(() => { ipMap.clear(); emailMap.clear(); }, RATE_WINDOW);

function sanitize(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>&"']/g, '').trim().slice(0, 2000);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: {
      'Content-Type': 'application/json',
      'X-Robots-Tag': 'noindex',
      'X-Response-Time': `${Date.now()}`,
    },
  });
}

export async function GET() {
  return json({ status: 'ok', uptime: process.uptime ? Math.floor(process.uptime()) : null });
}

export async function POST({ request }) {
  const start = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();

  const ipHits = (ipMap.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (ipHits.length >= MAX_PER_IP) {
    return json({ error: 'rate_limit', message: 'Too many requests.', retryAfter: 60 }, 429);
  }

  let body;
  try { body = await request.json(); } catch {
    return json({ error: 'bad_request', message: 'Invalid JSON' }, 400);
  }

  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const message = sanitize(body.message);
  const to = sanitize(body.to);
  const honeypot = sanitize(body._website);

  if (honeypot) return json({ success: true, message: 'Message delivered.' }, 200);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || name.length < 1 || !email || !emailRegex.test(email) || !message || message.length < 10 || to !== 'RF24KRSK@gmail.com') {
    return json({ error: 'validation', message: 'Invalid or incomplete payload.' }, 400);
  }

  const emailHits = (emailMap.get(email) || []).filter(t => now - t < RATE_WINDOW);
  if (emailHits.length >= MAX_PER_EMAIL) {
    return json({ error: 'rate_limit', message: 'Too many requests from this email.' }, 429);
  }

  ipHits.push(now);
  ipMap.set(ip, ipHits);
  emailHits.push(now);
  emailMap.set(email, emailHits);

  const emailPayload = {
    to: 'RF24KRSK@gmail.com',
    from: 'noreply@dev24.pro',
    subject: `[Consult] ${name} — ${email}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Message: ${message}`,
      `Locale: ${request.headers.get('x-locale') || 'EN'}`,
      `Timestamp: ${body.timestamp || new Date().toISOString()}`,
      `IP: ${ip}`,
      `---`,
      `Submitted at: ${new Date().toISOString()}`,
      `Response time: ${Date.now() - start}ms`,
    ].join('\n'),
  };

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });
      if (!res.ok) throw new Error(`Email API: ${res.status}`);
    } catch (err) {
      console.error(`[Consult] Email delivery failed: ${err.message}`);
      return json({ error: 'delivery', message: 'Transmission failed. Please try again later.' }, 502);
    }
  } else {
    console.log(`[Consult] DEV MODE — would send:\n${emailPayload.text}`);
  }

  // Notify Telegram bot
  try {
    const { notifySubmission } = await import('../telegram-bot.js');
    notifySubmission({ name, email, message }).catch(() => {});
  } catch {}

  return json({ success: true, message: 'Message delivered. I will respond within 24 hours.' });
}
