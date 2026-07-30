import { expect, test } from '@playwright/test';

import PONYTAIL from '../src/config/ponytail.config.js';

/**
 * Everything the site says should live at a URL of its own.
 *
 * Seventeen projects, five career entries and seven milestones all sat on hash
 * routes, which are not documents: twenty-nine pieces of writing competed as one
 * page and sitemap.xml listed a single address. Projects were given real pages
 * first; these are the remaining twelve.
 */

const careerSlug = (entry) => entry.period.replace(/[–—]/g, '-').replace(/\s+/g, '');

test('every career entry and milestone is served as its own document', async ({ request }) => {
  const en = PONYTAIL.LOCALE.EN;
  for (const entry of en.CAREER) {
    const url = `/career/${careerSlug(entry)}/`;
    const res = await request.get(url);
    expect(res.status(), `${url} must be served`).toBe(200);
    const html = await res.text();
    // The entry's own prose, not just the shell.
    expect(html, `${url} carries its own copy`).toContain(entry.company);
    expect(html).toContain('data-prerendered="career"');
  }
  for (const entry of en.ACHIEVEMENTS) {
    const url = `/achievement/${entry.year}/`;
    const res = await request.get(url);
    expect(res.status(), `${url} must be served`).toBe(200);
    const html = await res.text();
    expect(html, `${url} carries its own copy`).toContain(entry.title);
    expect(html).toContain('data-prerendered="achievement"');
  }
});

test('each of those pages has a canonical of its own', async ({ request }) => {
  const first = PONYTAIL.LOCALE.EN.CAREER[0];
  const res = await request.get(`/career/${careerSlug(first)}/`);
  const html = await res.text();
  expect(html).toContain(`<link rel="canonical" href="https://dev24.pro/career/${careerSlug(first)}"`);
  // A page that self-canonicalises to the homepage is not a page.
  expect(html).not.toContain('<link rel="canonical" href="https://dev24.pro/"');
});

test('the sitemap lists every page and nothing that redirects', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const en = PONYTAIL.LOCALE.EN;
  const expected = 3 // /, /en, /ru
    + en.PROJECTS.length * 2
    + en.CAREER.length * 2
    + en.ACHIEVEMENTS.length * 2;
  expect(locs.length, `sitemap has ${locs.length} entries`).toBe(expected);
  expect(new Set(locs).size, 'no duplicates').toBe(locs.length);
  // Trailing slashes would each cost a redirect on the way in.
  expect(locs.filter((u) => u !== 'https://dev24.pro/' && u.endsWith('/'))).toEqual([]);
});

test('opening a career URL shows the entry, not the homepage', async ({ page }) => {
  const first = PONYTAIL.LOCALE.EN.CAREER[0];
  await page.goto(`/career/${careerSlug(first)}/`);
  // The prerendered copy is removed once the app takes over and renders the
  // same entry interactively, so wait for the panel rather than the article.
  await expect(page.locator('#projectDetail')).toContainText(first.company, { timeout: 15_000 });
  await expect(page.locator('[data-prerendered]')).toHaveCount(0);
});

test('opening a milestone URL shows the milestone', async ({ page }) => {
  const first = PONYTAIL.LOCALE.EN.ACHIEVEMENTS[0];
  await page.goto(`/achievement/${first.year}/`);
  await expect(page.locator('#projectDetail')).toContainText(first.title, { timeout: 15_000 });
  await expect(page.locator('[data-prerendered]')).toHaveCount(0);
});

test('an unknown slug leaves the served page alone rather than half-routing', async ({ page }) => {
  // The document exists only because the dev server falls back; what matters is
  // that the app does not strip the prerendered copy and then show nothing.
  await page.goto('/career/1999-2000/');
  await page.waitForTimeout(1500);
  await expect(page.locator('#projectDetail')).not.toHaveClass(/active/);
});

test('the coffee easter egg exists only where it can be reached', async ({ page, request }) => {
  // It could not be tested because it could not be reached: business and desktop
  // hid the egg and its popup by name, terminal hid the overlay they lived in.
  // So a crypto wallet address, a QR image and their styles shipped on every
  // page with no way to open them. The terminal's `coffee` command is the
  // reachable version and prints the same address, so the dead copy is gone.
  const html = await (await request.get('/')).text();
  expect(html).not.toContain('coffeePopup');
  expect(html).not.toContain('coffee-egg');
  // The QR image went with it. Not asserted over HTTP: the preview server falls
  // back to index.html for anything missing, so a 200 here would prove nothing.
  expect(html).not.toContain('coffee-qr');

  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('portfolio-mode', 'terminal'));
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('.tsh-window')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(900);

  const input = page.locator('.tsh-window input');
  await input.fill('coffee');
  await input.press('Enter');
  await expect(page.locator('.tsh-log')).toContainText('TWTCH2ZhyKvzZU1ph6h1d4vTHpHyJDkN5i', { timeout: 10_000 });
});
