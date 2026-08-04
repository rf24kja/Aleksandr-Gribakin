import { expect, test } from '@playwright/test';

/**
 * Which theme a visitor gets on arrival.
 *
 * The rule has three parts and each one is a separate way to get it wrong: an
 * explicit choice wins, otherwise the system preference decides, and a
 * system-derived answer is never written to storage. That last part is the
 * quiet one — persisting it would pin the site to whatever the OS was during
 * the first visit and stop following it, which looks exactly like a switch
 * that no longer works.
 */

/** Loads the site fresh, optionally with a theme already chosen. */
async function boot(page, { choice = null } = {}) {
  if (!page.url().startsWith('http')) await page.goto('/');
  await page.evaluate((t) => {
    localStorage.removeItem('portfolio-mode'); // business, the default
    if (t) localStorage.setItem('theme', t);
    else localStorage.removeItem('theme');
  }, choice);
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'business', { timeout: 15_000 });
  await page.waitForTimeout(600);
}

const stored = (page) => page.evaluate(() => localStorage.getItem('theme'));
const background = (page) => page.evaluate(
  () => getComputedStyle(document.documentElement).getPropertyValue('--b-bg').trim(),
);

test.describe('a system set to dark', () => {
  test.use({ colorScheme: 'dark' });

  test('opens dark, and does not record that as a choice', async ({ page }) => {
    await boot(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await background(page)).toBe('#111');
    expect(await stored(page), 'nothing was chosen, so nothing is stored').toBeNull();
  });

  test('is decided before the first paint, not by the app afterwards', async ({ page }) => {
    // With every script file blocked, only the inline head script can run. If
    // the page is still light here, a dark-system visitor sees a white flash.
    await boot(page);
    await page.route('**/*.js', (route) => route.abort());
    await page.goto(`/?nojs=${Date.now()}`, { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.unroute('**/*.js');
  });

  test('yields to a visitor who chose light', async ({ page }) => {
    await boot(page, { choice: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await background(page)).toBe('#fafafa');
    expect(await stored(page)).toBe('light');
  });
});

test.describe('a system set to light', () => {
  test.use({ colorScheme: 'light' });

  test('opens light', async ({ page }) => {
    await boot(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await background(page)).toBe('#fafafa');
    expect(await stored(page)).toBeNull();
  });

  test('yields to a visitor who chose dark', async ({ page }) => {
    await boot(page, { choice: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await background(page)).toBe('#111');
  });
});

test.describe('following the system while it changes', () => {
  test.use({ colorScheme: 'light' });

  test('turns dark with the system, until a choice is made', async ({ page }) => {
    await boot(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await stored(page), 'following is not choosing').toBeNull();

    // Choosing light from the settings panel has to survive the system saying
    // dark — otherwise the switch appears to snap back on its own.
    await page.locator('#settingsGearUI').click(); // the business-mode gear
    await page.locator('[data-stheme="light"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await stored(page)).toBe('light');

    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
