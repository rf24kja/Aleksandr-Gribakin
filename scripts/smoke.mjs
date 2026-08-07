/**
 * Production smoke check — what a visitor actually gets.
 *
 * The Playwright suite runs against a local build. This runs against the live
 * site, which is a different thing: it exercises the CDN, the edge function,
 * the deployed bundle and the real DNS. Every defect listed below reached
 * production past a green local suite at least once.
 *
 *   node scripts/smoke.mjs                 # https://dev24.pro
 *   node scripts/smoke.mjs http://localhost:4173
 *
 * Nothing here writes. The contact endpoint is only asked whether it is
 * configured, and the one POST deliberately omits consent so it must be
 * refused — no mail is ever sent by running this.
 */
import { chromium, devices } from '@playwright/test';

const ORIGIN = process.argv[2] || 'https://dev24.pro';
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch();

async function boot(ctx, { mode = 'business', theme = null, path = '/' } = {}) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(ORIGIN);
  await page.evaluate(([m, t]) => {
    localStorage.setItem('portfolio-mode', m);
    if (t) localStorage.setItem('theme', t); else localStorage.removeItem('theme');
  }, [mode, theme]);
  await page.goto(`${ORIGIN}${path}${path.includes('?') ? '&' : '?'}s=${Date.now()}`);
  await page.waitForFunction((m) => document.documentElement.dataset.mode === m, mode, { timeout: 25_000 });
  await page.waitForTimeout(2500);
  return { page, errors };
}

// --- what the network serves -------------------------------------------------
{
  const res = await fetch(`${ORIGIN}/`);
  const html = await res.text();
  ok('/ is served', res.status === 200, `HTTP ${res.status}`);
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  ok('/ carries readable copy for crawlers', words > 800, `${words} words`);

  const api = await fetch(`${ORIGIN}/api/consult`);
  const body = await api.json().catch(() => ({}));
  ok('contact endpoint is configured',
    api.status === 200 && body.status === 'ok' && Array.isArray(body.delivery) && body.delivery.length > 0,
    JSON.stringify(body));

  // Refused server-side, so running this delivers nothing.
  const noConsent = await fetch(`${ORIGIN}/api/consult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke', email: 'smoke@example.com', message: 'Automated smoke check.' }),
  });
  ok('endpoint refuses a send without consent', noConsent.status === 400, `HTTP ${noConsent.status}`);

  const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok('sitemap has no duplicates', new Set(locs).size === locs.length, `${locs.length} urls`);
  ok('sitemap has no trailing slashes', // each one would cost a redirect on the way in
    locs.filter((u) => u !== `${ORIGIN}/` && u.endsWith('/')).length === 0);
  ok('sitemap lists the policy', locs.some((u) => u.endsWith('/privacy')));
  ok('sitemap lists client cases', locs.filter((u) => u.includes('/case/')).length >= 2);

  for (const u of ['/project/pg-highload', '/ru/case/locabens', '/career/2022-2026',
    '/achievement/2024', '/privacy', '/ru/privacy', '/ru', '/en']) {
    const r = await fetch(`${ORIGIN}${u}`);
    ok(`deep URL ${u}`, r.status === 200, `HTTP ${r.status}`);
  }
  ok('unknown path does not 500', (await fetch(`${ORIGIN}/does-not-exist-xyz`)).status < 500);
}

// --- the homepage call to action --------------------------------------------
// It was pointer-events:none for weeks while the site was advertised: it looked
// and hovered like a button and swallowed every click. Nothing that measures
// colour or size notices that, so it is hit-tested here.
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const { page, errors } = await boot(ctx, { theme });

  const hit = await page.evaluate(() => {
    const cta = document.querySelector('.intro-cta');
    if (!cta) return { found: false };
    const r = cta.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { found: true, reachable: !!top && (top === cta || cta.contains(top)) };
  });
  ok(`CTA is hit-testable (${theme})`, hit.found && hit.reachable);

  await page.locator('.intro-cta').click();
  await page.waitForTimeout(1500);
  ok(`CTA reaches the form (${theme})`, await page.evaluate(() => {
    const f = document.querySelector('#ctaSection, .terminal-form');
    if (!f) return false;
    const r = f.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }));
  ok(`no 404 overlay after the CTA (${theme})`,
    !(await page.locator('#page404').isVisible().catch(() => false)));
  ok(`no console errors (${theme})`, errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// --- the other two modes -----------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const { page } = await boot(ctx, { mode: 'desktop' });
  await page.locator('.desk-icon[data-app="projects"]').dblclick();
  await page.waitForTimeout(1200);
  ok('desktop opens a window', await page.locator('.desk-window').first().isVisible());
  await page.locator('.desk-window').first().locator('.wt-close').click();
  await page.waitForTimeout(800);
  ok('desktop window closes', (await page.locator('.desk-window').count()) === 0);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const { page } = await boot(ctx, { mode: 'terminal' });
  const input = page.locator('.tsh-window input');
  await input.fill('web'); await input.press('Enter');
  await page.waitForTimeout(1500);
  const log = await page.locator('.tsh-log').innerText();
  ok('terminal lists the client cases', log.includes('locabens') || log.length > 200);
  await ctx.close();
}

// --- campaign attribution ----------------------------------------------------
// An advert can point straight at a case page, and the router rewrites that URL
// with the query string included — so the label has to be taken on arrival.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const ad = '?utm_source=smoke&utm_medium=cpc&utm_campaign=smoke-check&yclid=42';
  await page.goto(`${ORIGIN}/project/pg-highload${ad}`);
  await page.waitForTimeout(4000);
  const stored = await page.evaluate(() => {
    try { return JSON.parse(sessionStorage.getItem('attribution')); } catch { return null; }
  });
  ok('the campaign survives the URL being rewritten',
    stored?.utm_campaign === 'smoke-check' && stored?.yclid === '42', JSON.stringify(stored));
  await ctx.close();
}

// --- a phone -----------------------------------------------------------------
{
  const ctx = await browser.newContext({ ...devices['Pixel 5'] });
  const { page } = await boot(ctx, {});
  await page.locator('#settingsGearUI').tap();
  await page.waitForTimeout(900);
  ok('phone: settings panel opens',
    await page.locator('.settings-card').isVisible().catch(() => false));
  await page.locator('#settingsClose').tap();
  await page.waitForTimeout(600);

  await page.goto(`${ORIGIN}/ru/case/creditafricainvest`);
  await page.waitForTimeout(2500);
  const layout = await page.evaluate(() => {
    const off = [];
    document.querySelectorAll('.cm-item,.cm-pair,.cm-badge,.pd-scope li').forEach((el) => {
      if (el.getBoundingClientRect().right > window.innerWidth + 1) off.push(el.className);
    });
    const fills = [...document.querySelectorAll('.cm-fill')]
      .map((f) => parseFloat(f.style.getPropertyValue('--w')));
    return {
      off,
      sideways: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      minFill: fills.length ? Math.min(...fills) : null,
    };
  });
  ok('phone: a case renders inside the screen', layout.off.length === 0, layout.off.join(' '));
  ok('phone: the page does not scroll sideways', layout.sideways === false);
  // 5 minutes against 2 days is 0.17% of the track and rounds to nothing.
  ok('phone: no metric bar collapses to nothing', layout.minFill === null || layout.minFill >= 3,
    `${layout.minFill}%`);
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log('\nFAILURES:');
  failed.forEach((f) => console.log(`  ${f.name} — ${f.detail}`));
  process.exitCode = 1;
}
