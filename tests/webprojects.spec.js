import { expect, test } from '@playwright/test';

import { WEB_PROJECTS, isPublishable, webProjects } from '../src/data/webProjects.js';

/**
 * Client cases, and the silence they keep until they are real.
 *
 * The section carries claims about other companies on a site running paid
 * advertising, so the dangerous state is not a broken card — it is a card that
 * renders convincingly before anyone has confirmed the facts behind it. These
 * tests hold the gate shut: while every entry is a draft, no mode may show a
 * heading, a folder, a command or a URL that promises a case.
 */

test.describe('the gate', () => {
  test('a draft is never publishable, however complete it looks', () => {
    const dressed = {
      status: 'draft',
      period: '2019–2021',
      capacity: 'contractor',
      stack: ['React'],
      case: { EN: { situation: 'x', work: 'y', outcome: 'z' } },
    };
    expect(isPublishable(dressed), 'status alone decides').toBe(false);
  });

  test('published but incomplete is also refused', () => {
    // Half a case is the shape a guess arrives in.
    for (const missing of ['period', 'capacity', 'case']) {
      const entry = {
        status: 'published',
        period: '2019–2021',
        capacity: 'contractor',
        case: { EN: { situation: 'x' } },
      };
      delete entry[missing];
      expect(isPublishable(entry), `missing ${missing} must not publish`).toBe(false);
    }
  });

  test('a missing stack does not block a case', () => {
    // Stack is the one field readable off the live site rather than recalled,
    // so it is filled in from what each domain serves — and three of them sit
    // behind a WAF and give up nothing. Requiring it would have forced a guess.
    expect(isPublishable({
      status: 'published',
      period: '2022',
      capacity: 'solo',
      case: { EN: { situation: 'x' } },
    })).toBe(true);
  });

  test('every shipped entry is either published-and-complete, or invisible', () => {
    for (const entry of WEB_PROJECTS) {
      if (entry.status === 'published') {
        expect(isPublishable(entry), `${entry.id} claims published`).toBe(true);
      }
    }
    // Whatever the file currently holds, the rendered list only ever contains
    // entries that passed the gate.
    expect(webProjects('RU').length).toBe(WEB_PROJECTS.filter(isPublishable).length);
  });

  test('no entry invents an outcome for a client', () => {
    // A draft may carry only what was measured from the public site. Prose
    // about the work is exactly what has to come from the person who did it.
    for (const entry of WEB_PROJECTS.filter((e) => e.status !== 'published')) {
      expect(entry.case, `${entry.id} is a draft and must carry no case copy`).toBeUndefined();
    }
  });
});

test.describe('with nothing published, the site says nothing', () => {
  test.skip(webProjects('EN').length > 0, 'cases exist — this describes the empty state');

  test('business shows no client section at all', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'business', { timeout: 15_000 });
    await page.waitForTimeout(1200);
    // Not "hidden" — absent. An empty heading in the served HTML is a promise
    // to a crawler that the page cannot keep.
    await expect(page.locator('#webOverlay')).toHaveCount(0);
    const html = await (await page.request.get('/')).text();
    // Markup, not stylesheet: the rules for these cards ship either way, and
    // asserting on the class name alone matched the CSS and proved nothing.
    expect(html).not.toContain('id="webOverlay"');
    expect(html).not.toContain('data-web=');
  });

  test('desktop has no client folder', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('portfolio-mode', 'desktop'));
    await page.goto(`/?t=${Date.now()}`);
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'desktop', { timeout: 15_000 });
    await page.waitForTimeout(1200);
    await expect(page.locator('.desk-icon[data-app="webprojects"]')).toHaveCount(0);
  });

  test('terminal does not advertise the command', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('portfolio-mode', 'terminal'));
    await page.goto(`/?t=${Date.now()}`);
    await expect(page.locator('.tsh-window')).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(900);
    const input = page.locator('.tsh-window input');
    await input.fill('help');
    await input.press('Enter');
    await page.waitForTimeout(800);
    const log = await page.locator('.tsh-log').innerText();
    expect(log).not.toMatch(/^\s*web\b/m);
  });

  test('the sitemap offers no case URLs', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toContain('/case/');
  });
});

test.describe('once a case is published', () => {
  test.skip(webProjects('EN').length === 0, 'no cases yet — covered by the empty-state suite');

  test('it opens in business, desktop and terminal', async ({ page }) => {
    const first = webProjects('EN')[0];

    await page.goto('/');
    await expect(page.locator(`.web-card[data-web="${first.id}"]`)).toBeVisible({ timeout: 15_000 });
    await page.locator(`.web-card[data-web="${first.id}"]`).click();
    await expect(page.locator('#projectDetail')).toContainText(first.name, { timeout: 10_000 });

    await page.evaluate(() => localStorage.setItem('portfolio-mode', 'terminal'));
    await page.goto(`/?t=${Date.now()}`);
    await expect(page.locator('.tsh-window')).toBeVisible({ timeout: 15_000 });
    const input = page.locator('.tsh-window input');
    await input.fill(`web ${first.id}`);
    await input.press('Enter');
    await expect(page.locator('.tsh-log')).toContainText(first.name, { timeout: 10_000 });
  });

  test('each case is served as its own document', async ({ request }) => {
    for (const item of webProjects('EN')) {
      const res = await request.get(`/case/${item.id}/`);
      expect(res.status(), `/case/${item.id} must be served`).toBe(200);
      const html = await res.text();
      expect(html).toContain('data-prerendered="case"');
    }
  });
});
