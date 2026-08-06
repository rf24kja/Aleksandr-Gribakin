import { expect, test } from '@playwright/test';

import { PROCESS, CONTACTS, TERMS } from '../src/data/process.js';
import { PRIVACY } from '../src/data/privacy.js';

/**
 * The commitments, the contacts and the policy.
 *
 * Two properties are worth a test rather than a glance. The first is that the
 * hours, the reply time and the address say the same thing in all three modes
 * and in the footer — they are read from one file precisely so they cannot
 * drift, and a test is what keeps that true after someone edits in a hurry.
 * The second is the consent gate: the form must not send without it, and the
 * terminal must not become the way around it.
 */

async function boot(page, { mode = 'business', lang = null } = {}) {
  if (!page.url().startsWith('http')) await page.goto('/');
  await page.evaluate(([m, l]) => {
    localStorage.setItem('portfolio-mode', m);
    if (l) localStorage.setItem('portfolio-lang', l); else localStorage.removeItem('portfolio-lang');
  }, [mode, lang]);
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode, { timeout: 15_000 });
  await page.waitForTimeout(1200);
}

test.describe('how I work', () => {
  test('business shows every step', async ({ page }) => {
    await boot(page);
    await expect(page.locator('#processOverlay')).toHaveCount(1);
    await expect(page.locator('.process-step')).toHaveCount(PROCESS.length);
    await expect(page.locator('#processOverlay')).toContainText(PROCESS[0].title.EN);
  });

  test('terminal prints the same steps', async ({ page }) => {
    await boot(page, { mode: 'terminal' });
    const input = page.locator('.tsh-window input');
    await input.fill('process');
    await input.press('Enter');
    await page.waitForTimeout(1200);
    const log = await page.locator('.tsh-log').innerText();
    for (const step of PROCESS) {
      expect(log, `step ${step.n} must appear`).toContain(step.title.EN);
    }
  });

  test('desktop opens it as a window', async ({ page }) => {
    await boot(page, { mode: 'desktop' });
    const icon = page.locator('.desk-icon[data-app="process"]');
    await expect(icon).toHaveCount(1);
    if (page.viewportSize().width <= 768) await icon.tap(); else await icon.dblclick();
    await page.waitForTimeout(1000);
    await expect(page.locator('.desk-window')).toContainText(PROCESS[0].title.EN);
  });
});

test.describe('one source for the commitments', () => {
  test('the footer quotes the same hours as the process section', async ({ page }) => {
    await boot(page);
    const footer = await page.locator('#siteFooter').innerText();
    // Both come from TERMS.hours; if someone hardcodes one, they diverge.
    expect(footer).toContain(TERMS.hours.tz);
    expect(footer).toContain(TERMS.hours.from);
    expect(footer).toContain(CONTACTS.email);
    expect(footer).toContain(CONTACTS.telegram);
  });

  test('the terminal quotes the same address', async ({ page }) => {
    await boot(page, { mode: 'terminal' });
    const input = page.locator('.tsh-window input');
    await input.fill('contact');
    await input.press('Enter');
    await page.waitForTimeout(1200);
    const log = await page.locator('.tsh-log').innerText();
    expect(log).toContain(CONTACTS.email);
    expect(log).toContain(CONTACTS.telegram);
    expect(log).toContain(TERMS.hours.tz);
  });
});

test.describe('the privacy policy', () => {
  for (const [path, lang] of [['/privacy/', 'EN'], ['/ru/privacy/', 'RU']]) {
    test(`${path} is served as a document`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toContain('data-prerendered="privacy"');
      // The specifics are the point: a policy that does not name what it
      // collects is boilerplate.
      expect(html).toContain('portfolio-mode');
      expect(html).toContain('Resend');
      expect(html).toContain(PRIVACY[lang].sections[0].h);
    });
  }

  test('it does not claim a tracker that is not running', async ({ request }) => {
    // Metrica is not connected. If it is ever added, this file must be updated
    // in the same deploy — a policy that omits a live tracker is worse than
    // none, and this test is the reminder.
    const html = await (await request.get('/privacy/')).text();
    // Scoped to the policy text: the counter's own meta tag carries the word
    // "yandex-metrica" whether or not it holds an id, and matching that proved
    // nothing except that the tag exists.
    const policy = html.match(/<article[^>]*data-prerendered="privacy"[\s\S]*?<\/article>/)?.[0] || '';
    expect(policy, 'the policy must be in the served document').not.toBe('');
    const mentionsMetrica = /metrica|метрик/i.test(policy);
    const metricaLive = /name="yandex-metrica" content="[^"]+"/.test(html);
    expect(mentionsMetrica, 'policy and counter must agree').toBe(metricaLive);
  });

  test('the terminal can print it', async ({ page }) => {
    await boot(page, { mode: 'terminal' });
    const input = page.locator('.tsh-window input');
    await input.fill('legal');
    await input.press('Enter');
    await page.waitForTimeout(1400);
    await expect(page.locator('.tsh-log')).toContainText(PRIVACY.EN.sections[0].h);
  });
});

test.describe('consent', () => {
  test('the form will not send without it', async ({ page }) => {
    await boot(page);
    let posted = false;
    await page.route('**/api/consult', (route) => {
      if (route.request().method() === 'POST') posted = true;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });

    const form = page.locator('[data-form="consult"]');
    await form.scrollIntoViewIfNeeded();
    await form.locator('input[name="name"]').fill('Aleksandr');
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('textarea[name="message"]').fill('A message that is long enough.');
    await form.locator('[type="submit"]').click();
    await page.waitForTimeout(1200);

    expect(posted, 'nothing may be sent without consent').toBe(false);
    await expect(form.locator('[data-field-error="consent"]')).not.toBeEmpty();
  });

  test('it sends once the box is ticked', async ({ page }) => {
    await boot(page);
    const posted = page.waitForRequest(
      (r) => r.url().includes('/api/consult') && r.method() === 'POST',
      { timeout: 10_000 },
    );
    await page.route('**/api/consult', (route) => (route.request().method() === 'POST'
      ? route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
      : route.fallback()));

    const form = page.locator('[data-form="consult"]');
    await form.scrollIntoViewIfNeeded();
    await form.locator('input[name="name"]').fill('Aleksandr');
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('textarea[name="message"]').fill('A message that is long enough.');
    await form.locator('input[name="consent"]').check();
    await form.locator('[type="submit"]').click();

    const body = JSON.parse((await posted).postData());
    expect(body.consent).toBe(true);
  });

  test('the terminal asks for it and stops when refused', async ({ page }) => {
    await boot(page, { mode: 'terminal' });
    let posted = false;
    await page.route('**/api/consult', (route) => {
      if (route.request().method() === 'POST') posted = true;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });

    const input = page.locator('.tsh-window input');
    for (const line of ['contact', 'Aleksandr', 'test@example.com', 'A message that is long enough.', 'n']) {
      await input.fill(line);
      await input.press('Enter');
      await page.waitForTimeout(700);
    }
    expect(posted, 'the shell is not a way around the agreement').toBe(false);
  });
});
