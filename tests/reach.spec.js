import { expect, test } from '@playwright/test';

/**
 * Whether a published thing can actually be reached with a finger.
 *
 * Every defect here was reported from a phone, and none of them was a broken
 * feature: the ten client cases were live and printing, the coffee address had
 * always been in the terminal, the Telegram link was a correct anchor. They
 * were simply unreachable — no chip, no icon, a tap target the height of a line
 * of 11px type. A feature nobody can touch is not shipped.
 */

// Apple's guidance is 44px, Google's 48. Below 40 a link at the bottom of a
// scrolling window is a coin toss, which is what the Telegram link was.
const MIN_TAP = 40;

const WALLET = 'TWTCH2ZhyKvzZU1ph6h1d4vTHpHyJDkN5i';

/**
 * Commands a visitor is meant to find without a keyboard. `open`, `lang` and
 * `mode` are absent on purpose: each needs an argument, so a bare tap could
 * only print its usage.
 */
const CHIPPED = ['help', 'whoami', 'about', 'stats', 'career', 'projects', 'web',
  'stack', 'achievements', 'process', 'legal', 'contact', 'coffee'];

async function boot(page, mode) {
  await page.goto('/');
  await page.evaluate((m) => localStorage.setItem('portfolio-mode', m), mode);
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode, { timeout: 15_000 });
  await page.waitForTimeout(1000);
}

async function bootTerminal(page) {
  await boot(page, 'terminal');
  await expect(page.locator('.tsh-window')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(700);
}

async function runInTerminal(page, command) {
  const log = page.locator('.tsh-log');
  const before = await log.innerText();
  const input = page.locator('.tsh-window input');
  await input.fill(command);
  await input.press('Enter');
  await expect.poll(async () => log.innerText(), { timeout: 10_000 }).not.toBe(before);
  await page.waitForTimeout(400);
}

test.describe('the terminal offers what it lists', () => {
  test('every command worth tapping has a chip', async ({ page }) => {
    await bootTerminal(page);
    const chips = (await page.locator('.tsh-chip').allInnerTexts()).map((c) => c.trim());
    const missing = CHIPPED.filter((c) => !chips.includes(c));
    expect(missing, `listed in help, missing from the chip strip: ${missing.join(', ')}`).toEqual([]);
  });

  test('the client cases are one tap away, not one guess away', async ({ page }) => {
    await bootTerminal(page);
    const chip = page.locator('.tsh-chip', { hasText: /^web$/ });
    await expect(chip).toHaveCount(1);
    await chip.click();
    // The shell staggers its output, so the listing arrives a few lines at a
    // time — polling waits for the last case rather than the first.
    for (const id of ['engelvoelkers', 'sixt', 'properstar']) {
      await expect.poll(
        async () => (await page.locator('.tsh-log').innerText()).includes(id),
        { timeout: 15_000, message: `case ${id} never appeared in the terminal listing` },
      ).toBe(true);
    }
  });

  // Seventeen chips, each with its own staggered output — well past the
  // default budget, and the point of the test is coverage, not speed.
  test('a chip prints something, whichever one it is', async ({ page }) => {
    test.setTimeout(180_000);
    await bootTerminal(page);
    const names = (await page.locator('.tsh-chip').allInnerTexts()).map((c) => c.trim());
    expect(names.length).toBeGreaterThan(10);
    const silent = [];
    for (const name of names) {
      // `clear` and `exit` empty the log by design; `contact` opens a prompt
      // that would swallow every chip after it — it has its own tests.
      if (['clear', 'exit', 'contact'].includes(name)) continue;
      const before = (await page.locator('.tsh-log').innerText()).length;
      await page.locator('.tsh-chip', { hasText: new RegExp(`^${name}$`) }).first().click();
      const grew = await expect.poll(
        async () => (await page.locator('.tsh-log').innerText()).length - before,
        { timeout: 6_000 },
      ).toBeGreaterThan(3).then(() => true, () => false);
      if (!grew) silent.push(name);
    }
    expect(silent, `chips that printed nothing: ${silent.join(', ')}`).toEqual([]);
  });

  test('help offers the row for an optional argument as runnable', async ({ page }) => {
    await bootTerminal(page);
    await runInTerminal(page, 'help');
    // `web [<id>]` lists every case on its own, so its row has to be tappable;
    // `open <project-id>` cannot be, and must not become so.
    const web = page.locator('.tsh-log [data-run="web"]');
    await expect(web.first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.tsh-log [data-run="open"]')).toHaveCount(0);
  });
});

test.describe('the coffee is offered by every interface', () => {
  test('the terminal prints the address', async ({ page }) => {
    await bootTerminal(page);
    await runInTerminal(page, 'coffee');
    expect(await page.locator('.tsh-log').innerText()).toContain(WALLET);
  });

  test('the desktop has an app for it', async ({ page }) => {
    await boot(page, 'desktop');
    const icon = page.locator('.desk-icon[data-app="coffee"]');
    await expect(icon).toHaveCount(1);
    await icon.dblclick();
    const win = page.locator('.desk-window', { hasText: WALLET });
    await expect(win).toBeVisible();
    await expect(win.locator('.wb-copy')).toBeVisible();
  });

  test('the business footer carries it, folded shut', async ({ page }) => {
    await boot(page, 'business');
    const details = page.locator('#siteFooter .f-coffee');
    await expect(details).toHaveCount(1);
    // Shut by default: the footer answers a buyer's three questions first, and
    // a wallet address under the invoicing line answers none of them.
    expect(await details.evaluate((d) => d.open)).toBe(false);
    await details.locator('summary').click();
    await expect(details.locator('.f-coffee-addr')).toHaveText(WALLET);
  });
});

test.describe('contact links are big enough to hit', () => {
  test('the business footer', async ({ page }) => {
    await boot(page, 'business');
    for (const sel of ['a[href^="mailto:"]', 'a[href^="https://t.me"]']) {
      const link = page.locator(`#siteFooter ${sel}`).first();
      await link.scrollIntoViewIfNeeded();
      const box = await link.boundingBox();
      expect(box.height, `${sel} is ${Math.round(box.height)}px tall`).toBeGreaterThanOrEqual(MIN_TAP);
    }
  });

  test('the desktop Mail window', async ({ page }) => {
    await boot(page, 'desktop');
    await page.locator('.desk-icon[data-app="mail"]').dblclick();
    const win = page.locator('.desk-window').first();
    await expect(win).toBeVisible();
    for (const sel of ['a[href^="mailto:"]', 'a[href^="https://t.me"]']) {
      const link = win.locator(sel).first();
      await link.scrollIntoViewIfNeeded();
      const box = await link.boundingBox();
      expect(box.height, `${sel} is ${Math.round(box.height)}px tall`).toBeGreaterThanOrEqual(MIN_TAP);
    }
  });

  test('nothing covers the Telegram link', async ({ page }) => {
    await boot(page, 'desktop');
    await page.locator('.desk-icon[data-app="mail"]').dblclick();
    const link = page.locator('.desk-window a[href^="https://t.me"]').first();
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    const onTop = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return el?.closest('a')?.getAttribute('href') || null;
    }, [box.x + box.width / 2, box.y + box.height / 2]);
    expect(onTop).toContain('t.me');
  });
});
