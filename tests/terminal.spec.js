import { expect, test } from '@playwright/test';

/**
 * The terminal is one of three interfaces to the same content, and its shell is
 * the only way through it. A command that prints nothing is a dead end with no
 * error to explain it, so each one here has to produce output — and the ones
 * that change the application's state have to actually change it.
 */

async function bootTerminal(page, lang = 'EN') {
  await page.goto('/');
  await page.evaluate((l) => {
    localStorage.setItem('portfolio-mode', 'terminal');
    localStorage.setItem('portfolio-lang', l);
    localStorage.removeItem('tsh-history');
  }, lang);
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('.tsh-window')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(900);
}

/**
 * Types a command and waits for the shell to respond.
 *
 * Waiting for the echoed command to appear does not work for all of them:
 * `clear` and `lang` rebuild the log rather than appending to it, so the echo
 * is wiped before it can be observed. Waiting for the log to differ covers
 * both shapes.
 */
async function run(page, command) {
  const log = page.locator('.tsh-log');
  const before = await log.innerText();
  const input = page.locator('.tsh-window input');
  await input.fill(command);
  await input.press('Enter');
  await expect.poll(async () => log.innerText(), { timeout: 10_000 }).not.toBe(before);
  await page.waitForTimeout(450);
}

/** Everything printed since a marker length, so each command is judged alone. */
async function outputSince(page, before) {
  const all = await page.locator('.tsh-log').innerText();
  return all.slice(before);
}

const PRINTING_COMMANDS = [
  'help', 'whoami', 'about', 'stats', 'stats --breakdown',
  'career', 'career 1', 'projects', 'projects --cat=Infrastructure',
  'open gitops', 'stack', 'achievements', 'achievements 1',
  'neofetch', 'date', 'pwd', 'echo hello', 'sudo rm -rf /',
];

test('every command prints something', async ({ page }) => {
  await bootTerminal(page);
  const empty = [];
  for (const cmd of PRINTING_COMMANDS) {
    const before = (await page.locator('.tsh-log').innerText()).length;
    await run(page, cmd);
    const printed = (await outputSince(page, before)).replace(cmd, '').trim();
    if (printed.length < 3) empty.push(cmd);
  }
  expect(empty).toEqual([]);
});

test('an unknown command explains itself', async ({ page }) => {
  await bootTerminal(page);
  const before = (await page.locator('.tsh-log').innerText()).length;
  await run(page, 'definitelynotacommand');
  const printed = await outputSince(page, before);
  expect(printed.trim().length).toBeGreaterThan(3);
  // It must point somewhere useful rather than just failing.
  expect(printed).toMatch(/help/i);
});

test('clear empties the log and the shell still works', async ({ page }) => {
  await bootTerminal(page);
  await run(page, 'whoami');
  expect((await page.locator('.tsh-log').innerText()).length).toBeGreaterThan(40);

  const input = page.locator('.tsh-window input');
  await input.fill('clear');
  await input.press('Enter');
  await expect.poll(async () => (await page.locator('.tsh-log').innerText()).trim().length).toBeLessThan(40);

  await run(page, 'whoami');
  await expect(page.locator('.tsh-log')).toContainText(/whoami/i);
});

test('lang switches the interface and later output', async ({ page }) => {
  await bootTerminal(page, 'EN');
  await run(page, 'lang ru');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');

  // Changing the locale rebuilds the shell and reprints the banner, so wait for
  // that to settle before judging what the next command writes.
  await expect(page.locator('.tsh-log')).toContainText(/[Ѐ-ӿ]/, { timeout: 10_000 });
  await page.waitForTimeout(800);

  const before = (await page.locator('.tsh-log').innerText()).length;
  await run(page, 'whoami');
  expect(await outputSince(page, before)).toMatch(/[Ѐ-ӿ]/);
});

test('mode leaves the terminal for another interface', async ({ page }) => {
  await bootTerminal(page);
  await run(page, 'mode business');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'business', { timeout: 10_000 });
});

test('history records what was run, and the up arrow recalls it', async ({ page }) => {
  await bootTerminal(page);
  await run(page, 'whoami');
  await run(page, 'stack');

  const before = (await page.locator('.tsh-log').innerText()).length;
  await run(page, 'history');
  const printed = await outputSince(page, before);
  expect(printed).toContain('whoami');
  expect(printed).toContain('stack');

  const input = page.locator('.tsh-window input');
  await input.press('ArrowUp');
  await expect(input).toHaveValue(/history|stack/);
});

test('tab completes a command', async ({ page }) => {
  await bootTerminal(page);
  const input = page.locator('.tsh-window input');
  await input.fill('neo');
  await input.press('Tab');
  await expect(input).toHaveValue(/neofetch/);
});

test('open reports a project that does not exist instead of printing nothing', async ({ page }) => {
  await bootTerminal(page);
  const before = (await page.locator('.tsh-log').innerText()).length;
  await run(page, 'open no-such-project');
  const printed = await outputSince(page, before);
  expect(printed.trim().length).toBeGreaterThan(3);
});

test('contact collects a message and reports the outcome', async ({ page }) => {
  await bootTerminal(page);
  const input = page.locator('.tsh-window input');

  await run(page, 'contact');
  // The flow asks four things now: the fourth is consent, and 'y' is the
  // only answer that lets it send.
  for (const answer of ['Terminal Check', `ci-${Date.now()}@example.com`, 'Checking the transmit flow end to end.', 'y']) {
    await input.fill(answer);
    await input.press('Enter');
    await page.waitForTimeout(500);
  }
  // Against the preview server /api/consult does not exist, so this must fail
  // loudly and hand over the address — never finish silently.
  await expect(page.locator('.tsh-log')).toContainText(/RF24KRSK@gmail\.com/i, { timeout: 20_000 });
});
