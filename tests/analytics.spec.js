import { expect, test } from '@playwright/test';

/**
 * What the counters are told, and when.
 *
 * Three of them run on this site and none can be checked by looking at the
 * page. The mistakes they invite are all silent: a single-page site that
 * reports one view per visit and calls the rest a bounce; a conversion counted
 * on the click rather than on the send, so a broken endpoint still looks like a
 * stream of enquiries; a second view fired for the address the visitor is
 * already on. Each of those makes an advertising budget read better than it is,
 * which is the direction that costs money.
 *
 * The ids live in meta tags, so these tests rewrite the served HTML rather than
 * needing a build of their own. The counter hosts themselves are blocked: what
 * matters is what we hand them, and both queue their calls before their script
 * arrives, which is exactly what gets inspected.
 */

const YM = '99999999';
const GA = 'G-TEST00000';

/** Serves the real site with the counters configured, and nothing phoning home. */
async function withCounters(page, { ym = YM, ga = GA, vercel = false } = {}) {
  await page.route('**/_vercel/insights/**', (route) => (vercel
    ? route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.va=function(){};' })
    : route.fulfill({ status: 404, body: '' })));
  await page.route(/mc\.yandex\.ru|googletagmanager\.com/, (route) => route.abort());
  await page.route('**/*', async (route) => {
    const res = await route.fetch();
    if (!(res.headers()['content-type'] || '').includes('text/html')) {
      return route.fulfill({ response: res });
    }
    const body = (await res.text())
      .replace('<meta name="yandex-metrica" content=""', `<meta name="yandex-metrica" content="${ym}"`)
      .replace('<meta name="google-analytics" content=""', `<meta name="google-analytics" content="${ga}"`);
    return route.fulfill({ response: res, body });
  });
}

async function boot(page, { mode = 'business', path = '/' } = {}) {
  if (!page.url().startsWith('http')) await page.goto('/');
  await page.evaluate((m) => localStorage.setItem('portfolio-mode', m), mode);
  await page.goto(`${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode, { timeout: 15_000 });
  await page.waitForTimeout(1200);
}

/** Everything handed to Metrica, still queued because its script never loaded. */
const metrica = (page) => page.evaluate(() => (window.ym?.a || []).map((a) => [...a]));
/** Everything handed to GA4. `arguments` does not survive serialisation. */
const ga4 = (page) => page.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a)));

const hits = (calls) => calls.filter((c) => c[1] === 'hit');
const goals = (calls) => calls.filter((c) => c[1] === 'reachGoal');

// The rewriting handler is mid-fetch when a test ends, which surfaces as an
// error attributed to no test at all.
test.afterEach(async ({ page }) => { await page.unrouteAll({ behavior: 'ignoreErrors' }); });

test('an unconfigured build contacts nobody', async ({ page }) => {
  // This is what production serves until the ids are filled in, and it has to
  // be indistinguishable from the site before any of this existed.
  const external = [];
  page.on('request', (r) => {
    if (/mc\.yandex\.ru|googletagmanager\.com|google-analytics\.com/.test(r.url())) external.push(r.url());
  });
  // Vercel's script is a 404 until its toggle is switched on in the project,
  // and that is the only failure allowed here — anything else is a real one.
  const failures = [];
  page.on('response', (r) => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });

  await boot(page);
  await page.waitForTimeout(1500);
  expect(external, 'no counter is loaded without an id').toEqual([]);
  expect(failures.filter((f) => !f.includes('/_vercel/insights/'))).toEqual([]);
  expect(await metrica(page)).toEqual([]);
});

test.describe('with the counters configured', () => {
  test.beforeEach(async ({ page }) => { await withCounters(page); });

  test('the first view is reported once, not twice', async ({ page }) => {
    await boot(page);
    const calls = await metrica(page);
    expect(calls.some((c) => c[1] === 'init'), 'the counter is initialised').toBe(true);
    // init carries defer:true, or Metrica would report a view of its own on
    // top of ours and every visit would count double.
    const init = calls.find((c) => c[1] === 'init');
    expect(init[2].defer).toBe(true);
    expect(hits(calls), 'exactly one view for one page').toHaveLength(1);

    const events = await ga4(page);
    expect(events.filter((e) => e[0] === 'event' && e[1] === 'page_view')).toHaveLength(1);
    const config = events.find((e) => e[0] === 'config');
    expect(config[2].send_page_view, 'GA4 must not report its own view').toBe(false);
  });

  test('opening a project reports a view of that project', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => { window.location.hash = '#/project/pg-highload'; });
    await page.waitForTimeout(1500);

    const calls = hits(await metrica(page));
    expect(calls.length, 'a route change is a view').toBe(2);
    expect(calls[1][2]).toContain('#/project/pg-highload');
    // The second view says where it came from, or every internal step looks
    // like a fresh arrival from the advert.
    expect(calls[1][3].referer).toContain('/?t=');
  });

  test('the same address is never reported twice', async ({ page }) => {
    // The app rewrites the URL with replaceState when it resolves a
    // prerendered page; without the guard that lands as a second view.
    await boot(page, { path: '/project/pg-highload' });
    await page.waitForTimeout(1500);
    const seen = hits(await metrica(page)).map((c) => c[2]);
    expect(new Set(seen).size, seen.join(' | ')).toBe(seen.length);
  });

  test('switching interface is an event, not a view', async ({ page }) => {
    await boot(page);
    const before = hits(await metrica(page)).length;
    await page.evaluate(() => {
      document.dispatchEvent(new CustomEvent('mode:change', { detail: { from: 'business', to: 'terminal' } }));
    });
    await page.waitForTimeout(400);
    const calls = await metrica(page);
    expect(goals(calls).map((c) => c[2])).toContain('mode_switch');
    expect(hits(calls)).toHaveLength(before);
  });
});

test.describe('the enquiry goal', () => {
  test.beforeEach(async ({ page }) => { await withCounters(page); });

  async function send(page, status) {
    await page.route('**/api/consult', (route) => (route.request().method() === 'POST'
      ? route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(status === 200
          ? { ok: true }
          : { message: 'not configured', recipient: 'RF24KRSK@gmail.com' }),
      })
      : route.fallback()));
    const form = page.locator('[data-form="consult"]');
    await form.scrollIntoViewIfNeeded();
    await form.locator('input[name="name"]').fill('Александр');
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('textarea[name="message"]').fill('Проверка отправки формы, десять символов есть.');
    await form.locator('[type="submit"]').click();
    await page.waitForTimeout(1800);
  }

  test('counts a send that actually went through', async ({ page }) => {
    await boot(page);
    await send(page, 200);
    const names = goals(await metrica(page)).map((c) => c[2]);
    expect(names).toContain('consult');
    expect(names).not.toContain('consult_failed');
    expect((await ga4(page)).some((e) => e[1] === 'consult')).toBe(true);
  });

  test('does not count one that failed', async ({ page }) => {
    // The endpoint was down once while the site was being advertised. A goal
    // on the click would have shown a healthy conversion rate throughout.
    await boot(page);
    await send(page, 503);
    const names = goals(await metrica(page)).map((c) => c[2]);
    expect(names).not.toContain('consult');
    expect(names).toContain('consult_failed');
  });
});

test.describe('Vercel Web Analytics', () => {
  test('is requested once per page, and starts counting when the toggle is on', async ({ page }) => {
    // It has no id, so the only thing to get wrong is asking for it twice, or
    // not at all. It needs no deploy to start working: the moment the project
    // toggle is on, this same request stops being a 404.
    await withCounters(page, { vercel: true });
    await page.goto('/');
    // Counted across exactly one navigation, so the number means what it says.
    const loads = [];
    page.on('request', (r) => { if (r.url().includes('/_vercel/insights/script.js')) loads.push(r.url()); });
    await page.goto(`/?t=${Date.now()}`);
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'business', { timeout: 15_000 });
    await page.waitForTimeout(1500);
    expect(loads).toHaveLength(1);
    expect(await page.evaluate(() => typeof window.va)).toBe('function');
  });
});
