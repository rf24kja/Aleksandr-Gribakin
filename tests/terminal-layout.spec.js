import { expect, test } from '@playwright/test';

/**
 * Terminal output is a monospace layout, so alignment carries meaning.
 *
 * The commands wrap their own prose to the measured column count and indent the
 * continuation. When a line still exceeds the box, CSS wraps it instead — and
 * CSS starts the continuation at column zero, which puts a sentence fragment
 * flush under a label and reads as broken. Reported from a phone with the
 * keyboard up, where the window is at its narrowest.
 *
 * Rather than compare pixels, this measures the thing that actually breaks:
 * whether any rendered line occupies more vertical space than one line of text.
 */

const COMMANDS = [
  'stats', 'stats --breakdown', 'projects', 'career', 'achievements',
  'open gitops', 'open pg-highload', 'about', 'whoami', 'stack', 'help',
];

async function bootTerminal(page, lang) {
  await page.goto('/');
  await page.evaluate((l) => {
    localStorage.setItem('portfolio-mode', 'terminal');
    localStorage.setItem('portfolio-lang', l);
    localStorage.removeItem('terminal-history');
  }, lang);
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('.tsh-window')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(900);
}

async function run(page, command) {
  const log = page.locator('.tsh-log');
  const before = await log.innerText();
  const input = page.locator('.tsh-window input');
  await input.fill(command);
  await input.press('Enter');
  await expect.poll(async () => log.innerText(), { timeout: 10_000 }).not.toBe(before);
  await page.waitForTimeout(350);
}

/** Lines whose rendered height exceeds a single line — i.e. CSS wrapped them. */
async function cssWrappedLines(page) {
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.tsh-log .tsh-line').forEach((el) => {
      const text = el.textContent;
      if (!text.trim()) return;
      // ASCII art and rules are deliberately pre-formatted and allowed to be
      // clipped rather than wrapped.
      if (el.classList.contains('tsh-logo')) return;
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 16;
      const rows = Math.round(el.getBoundingClientRect().height / lh);
      if (rows > 1) out.push(`${rows} rows: ${text.trim().slice(0, 48)}`);
    });
    return out;
  });
}

for (const lang of ['RU', 'EN']) {
  test(`${lang}: no command output is wrapped by the browser`, async ({ page }) => {
    await bootTerminal(page, lang);
    for (const command of COMMANDS) {
      await run(page, command);
      const wrapped = await cssWrappedLines(page);
      expect(wrapped, `${command} produced lines the browser had to wrap`).toEqual([]);
      await run(page, 'clear');
    }
  });
}

test('output still fits when the keyboard takes half the window', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the on-screen keyboard only exists here');
  await bootTerminal(page, 'RU');

  // Shrinking the viewport is the closest honest stand-in for the keyboard: the
  // shell sizes itself to visualViewport, and this is where lines are tightest.
  await page.setViewportSize({ width: 390, height: 420 });
  await page.waitForTimeout(600);

  for (const command of ['stats', 'projects', 'career']) {
    await run(page, command);
    expect(await cssWrappedLines(page), `${command} at 390x420`).toEqual([]);
    await run(page, 'clear');
  }
});

test('the log never scrolls sideways', async ({ page }) => {
  await bootTerminal(page, 'RU');
  for (const command of ['stats --breakdown', 'projects', 'open gitops']) {
    await run(page, command);
    const overflow = await page.locator('.tsh-log').evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow, `${command} pushed the log sideways`).toBeLessThanOrEqual(1);
  }
});

test('a command chip does not raise the keyboard', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the on-screen keyboard only exists on touch');
  await bootTerminal(page, 'RU');

  // Focusing an input is what raises the keyboard on a phone. Running a command
  // from a chip used to focus the prompt unconditionally, so tapping `career`
  // opened the keyboard and the window resized under the output just asked for.
  const focused = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
  expect(await focused(), 'the prompt is not focused on arrival').not.toBe('tshInput');

  for (const cmd of ['career', 'projects', 'clear', 'help', 'whoami', 'stats']) {
    await page.locator(`.tsh-chip[data-cmd="${cmd}"]`).tap();
    await page.waitForTimeout(500);
    expect(await focused(), `${cmd} must not focus the prompt`).not.toBe('tshInput');
  }

  // Tapping the terminal itself is the gesture that does ask for the keyboard.
  await page.locator('.tsh-body').tap();
  await expect.poll(focused, { timeout: 5_000 }).toBe('tshInput');

  // And with it open, a chip keeps it open rather than flickering it shut.
  await page.locator('.tsh-chip[data-cmd="stats"]').tap();
  await page.waitForTimeout(500);
  expect(await focused(), 'an open keyboard stays open').toBe('tshInput');
});
