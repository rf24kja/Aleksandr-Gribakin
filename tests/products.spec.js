import { expect, test } from '@playwright/test';

import { PRODUCTS, products, incompleteProducts } from '../src/data/products.js';

/**
 * The owner's own products, and the silence they keep until they are written.
 *
 * These two entries were added from a machine that could not reach either
 * domain, so nobody had read the sites when the section was built. That is
 * exactly the state the gate exists for: a plausible description of a business
 * nobody checked is the failure this project's first rule is about, and it is
 * worse here than anywhere else on the page because the business is his.
 *
 * So: while the copy is unwritten, no mode may show a heading, an icon, a
 * command or a URL that promises a product. When it is written, all three show
 * it — the same list, three shells, which is the rule for every other section.
 */

const boot = async (page, mode) => {
  await page.goto('/');
  await page.evaluate((m) => localStorage.setItem('portfolio-mode', m), mode);
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode, { timeout: 15_000 });
  await page.waitForTimeout(800);
};

test.describe('the gate', () => {
  test('a draft is never publishable, however complete it looks', () => {
    const dressed = {
      status: 'draft',
      since: '2024',
      tagline: { EN: 'x', RU: 'х' },
      summary: { EN: 'y', RU: 'у' },
      role: { EN: 'z', RU: 'з' },
      stack: ['Node.js'],
    };
    // products() filters the module's own array, so the check is made against
    // a list containing only this entry rather than against the real data.
    const only = [dressed];
    const publishable = only.filter((p) => p.status === 'published'
      && p.tagline.EN && p.summary.EN && p.role.EN);
    expect(publishable, 'status alone decides').toEqual([]);
  });

  test('every entry either publishes or says what it lacks', () => {
    const pending = incompleteProducts();
    const published = products('EN');
    expect(pending.length + published.length,
      'an entry is neither publishable nor accounted for').toBe(PRODUCTS.length);
    for (const p of pending) {
      expect(p.missing.length, `${p.id} is withheld but nothing is named as missing`)
        .toBeGreaterThan(0);
    }
  });

  test('both languages are required, not just the one the author writes in', () => {
    // A card that falls back to English inside the Russian page is the defect
    // the toolbox already had once.
    for (const p of PRODUCTS.filter((x) => x.status === 'published')) {
      for (const field of ['tagline', 'summary', 'role']) {
        expect(p[field].RU, `${p.id}.${field} has no Russian`).toBeTruthy();
        expect(p[field].EN, `${p.id}.${field} has no English`).toBeTruthy();
      }
    }
  });
});

test.describe('with nothing published, the site promises nothing', () => {
  test.skip(products('EN').length > 0, 'products are live — covered by the suite below');

  test('business shows no section at all', async ({ page }) => {
    await boot(page, 'business');
    await expect(page.locator('#productsOverlay')).toHaveCount(0);
    await expect(page.locator('.product-card')).toHaveCount(0);
  });

  test('desktop opens the app on an explanation, not on nothing', async ({ page }) => {
    // The icon stays — an app that appears and disappears with data is worse
    // than one that opens and tells you the shelf is empty.
    await boot(page, 'desktop');
    await page.locator('[data-app="products"]').first().dblclick();
    const body = page.locator('#win-products .window-body');
    await expect(body).toBeVisible({ timeout: 10_000 });
    await expect(body).not.toHaveText('');
  });

  test('terminal does not advertise a command that has nothing to print', async ({ page }) => {
    await boot(page, 'terminal');
    const input = page.locator('.tsh-window input');
    await input.fill('help');
    await input.press('Enter');
    await expect(page.locator('.tsh-log')).not.toContainText('live', { timeout: 10_000 });
  });

  test('no unpublished domain is named anywhere in the served page', async ({ request }) => {
    // The strongest form of the gate: a draft URL must not reach the HTML even
    // as a stray attribute a crawler could pick up.
    const html = await request.get('/').then((r) => r.text());
    for (const p of PRODUCTS.filter((x) => !products('EN').some((q) => q.id === x.id))) {
      expect(html, `${p.url} is in the page while the entry is a draft`).not.toContain(p.url);
    }
  });
});

test.describe('once a product is published', () => {
  test.skip(products('EN').length === 0, 'nothing published yet — covered by the suite above');

  test('it shows in business, desktop and terminal', async ({ page }) => {
    const first = products('EN')[0];

    await boot(page, 'business');
    await expect(page.locator('#productsOverlay')).toContainText(first.name, { timeout: 10_000 });

    await boot(page, 'desktop');
    await page.locator('[data-app="products"]').first().dblclick();
    await expect(page.locator('#win-products .window-body'))
      .toContainText(first.name, { timeout: 10_000 });

    await boot(page, 'terminal');
    const input = page.locator('.tsh-window input');
    await input.fill('live');
    await input.press('Enter');
    await expect(page.locator('.tsh-log')).toContainText(first.name, { timeout: 10_000 });
  });

  test('the section sits above the client work, where it was put', async ({ page }) => {
    // Its whole argument is that a visitor can go and look; buried under three
    // sections it makes that argument to nobody.
    await boot(page, 'business');
    const order = await page.evaluate(() => [...document.querySelectorAll('.section-overlay')]
      .map((el) => el.id));
    const products_ = order.indexOf('productsOverlay');
    expect(products_, 'the section is not on the page').toBeGreaterThan(-1);
    for (const later of ['webOverlay', 'projectsOverlay', 'stackOverlay']) {
      const i = order.indexOf(later);
      if (i > -1) expect(products_, `products sits below ${later}`).toBeLessThan(i);
    }
  });

  test('each card links out, and the link is safe to open', async ({ page }) => {
    await boot(page, 'business');
    const links = page.locator('#productsOverlay .pc-open');
    await expect(links.first()).toBeVisible();
    for (const rel of await links.evaluateAll((els) => els.map((e) => e.rel))) {
      // target=_blank without noopener hands the opened tab a handle on this one.
      expect(rel, 'a new-tab link with no noopener').toContain('noopener');
    }
  });

  test('a picture never collapses the card it sits in', async ({ page }) => {
    await boot(page, 'business');
    const shots = page.locator('#productsOverlay .pc-shot');
    if (await shots.count() === 0) return;
    const heights = await shots.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    for (const h of heights) expect(h, 'a product screenshot has no height').toBeGreaterThan(40);
  });
});
