import { expect, test } from '@playwright/test';

/**
 * Every enquiry should say which advert paid for it.
 *
 * The trap is timing, not parsing. Campaign parameters live in the query
 * string, and this app rewrites the address with `replaceState` the moment it
 * resolves a route — so anything read at submit time reads an address the
 * advert's parameters have already been swept out of. These tests navigate,
 * let the app settle, then send the form and inspect what actually left the
 * browser.
 */

const AD = '?utm_source=yandex&utm_medium=cpc&utm_campaign=devops-consult&yclid=12345';

/** Sends the form and returns the parsed request body. */
async function submit(page) {
  const posted = page.waitForRequest(
    (r) => r.url().includes('/api/consult') && r.method() === 'POST',
  );
  await page.route('**/api/consult', (route) => (route.request().method() === 'POST'
    ? route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
    : route.fallback()));

  const form = page.locator('[data-form="consult"]');
  await form.scrollIntoViewIfNeeded();
  await form.locator('input[name="name"]').fill('Александр');
  await form.locator('input[name="email"]').fill('test@example.com');
  await form.locator('textarea[name="message"]').fill('Проверка меток, длина сообщения достаточная.');
  await form.locator('[type="submit"]').click();
  return JSON.parse((await posted).postData());
}

async function boot(page, path) {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'business', { timeout: 15_000 });
  await page.waitForTimeout(1200);
}

test('an enquiry carries the campaign that brought the visitor', async ({ page }) => {
  await boot(page, `/${AD}`);
  const body = await submit(page);
  expect(body.source).toMatchObject({
    utm_source: 'yandex',
    utm_medium: 'cpc',
    utm_campaign: 'devops-consult',
    yclid: '12345',
  });
});

test('the campaign survives the address being rewritten', async ({ page }) => {
  // An advert can point straight at a project page, and those are real
  // documents: the app turns the path into a hash route and replaces the
  // address, query string and all. Anything read at submit time is reading an
  // address the campaign has already been swept out of.
  await boot(page, `/project/pg-highload${AD}`);
  await page.waitForTimeout(1200);
  expect(page.url(), 'the app has dropped the query').not.toContain('utm_campaign');

  await page.evaluate(() => { window.location.hash = ''; });
  await page.waitForTimeout(1000);
  const body = await submit(page);
  expect(body.source.utm_campaign, 'read at arrival, not at submit').toBe('devops-consult');
});

test('an advert clicked later in the visit wins over an ordinary arrival', async ({ page }) => {
  // Someone lands from search, wanders off, and comes back through an advert.
  // Crediting the first visit would leave the campaign that actually paid for
  // the enquiry as the one label missing from it.
  await boot(page, '/');
  await boot(page, `/${AD}`);
  const body = await submit(page);
  expect(body.source.utm_campaign).toBe('devops-consult');
});

test('a first campaign is not overwritten by a plain internal reload', async ({ page }) => {
  await boot(page, `/${AD}`);
  await boot(page, '/');
  const body = await submit(page);
  expect(body.source.utm_campaign).toBe('devops-consult');
});

test('an ordinary visitor still says where they landed', async ({ page }) => {
  await boot(page, '/');
  const body = await submit(page);
  expect(body.source.landing).toBe('/');
  expect(body.source.utm_source).toBeUndefined();
});
