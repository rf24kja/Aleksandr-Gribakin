import { expect, test } from '@playwright/test';

/**
 * Desktop windows must stay reachable.
 *
 * Two defects this covers, both found by driving the interface rather than
 * reading it. A window opened at its requested size wherever the cascade put
 * it, so 640x440 on an 801x389 viewport ran off the bottom — and nothing in
 * this desktop resizes, so that content was simply unreachable. And only the
 * left and top edges were clamped while dragging, so a window could be pushed
 * past the right or bottom edge until it was entirely off screen, close button
 * included, with no way to bring it back.
 */

async function bootDesktop(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('portfolio-mode', 'desktop'));
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'desktop', { timeout: 15_000 });
  await page.waitForTimeout(1000);
}

async function openApp(page, id) {
  await page.locator(`.desk-icon[data-app="${id}"]`).dblclick();
  await expect(page.locator('.desk-window').first()).toBeVisible();
}

/** Work area is the viewport minus the taskbar pinned to its bottom. */
async function workArea(page) {
  return page.evaluate(() => {
    const tb = document.getElementById('taskbar');
    return {
      width: window.innerWidth,
      height: window.innerHeight - (tb ? tb.getBoundingClientRect().height : 42),
    };
  });
}

test('a window opens inside the work area', async ({ page }) => {
  await bootDesktop(page);
  await openApp(page, 'projects');
  const box = await page.locator('.desk-window').first().boundingBox();
  const area = await workArea(page);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(area.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(area.height + 1);
});

test('every app opens inside the work area', async ({ page }) => {
  await bootDesktop(page);
  const area = await workArea(page);
  for (const id of ['about', 'career', 'projects', 'achievements', 'mail', 'settings']) {
    await page.locator(`.desk-icon[data-app="${id}"]`).dblclick();
    const win = page.locator(`#win-${id}`);
    await expect(win).toBeVisible();
    const box = await win.boundingBox();
    expect(box.x + box.width, `${id} runs off the right`).toBeLessThanOrEqual(area.width + 1);
    expect(box.y + box.height, `${id} runs off the bottom`).toBeLessThanOrEqual(area.height + 1);
  }
});

test('a window cannot be dragged out of reach', async ({ page }) => {
  await bootDesktop(page);
  await openApp(page, 'projects');
  const win = page.locator('.desk-window').first();
  const bar = win.locator('.window-titlebar');
  const start = await bar.boundingBox();
  const area = await workArea(page);

  await page.mouse.move(start.x + 40, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(area.width + 800, area.height + 800, { steps: 8 });
  await page.mouse.up();

  const box = await win.boundingBox();
  // Enough of the window is left on screen to grab it again.
  expect(box.x).toBeLessThan(area.width - 40);
  expect(box.x + box.width).toBeGreaterThan(40);
  expect(box.y).toBeLessThan(area.height);
  expect(box.y).toBeGreaterThanOrEqual(0);

  // And the close button is still clickable, which is the point.
  await win.locator('.wt-close').click();
  await expect(win).toHaveCount(0);
});

test('a window survives the viewport shrinking under it', async ({ page }) => {
  await bootDesktop(page);
  await openApp(page, 'career');
  await page.setViewportSize({ width: 400, height: 420 });
  await page.waitForTimeout(500);

  const area = await workArea(page);
  const box = await page.locator('.desk-window').first().boundingBox();
  expect(box.x).toBeLessThan(area.width - 40);
  expect(box.y).toBeLessThan(area.height);
  expect(box.width).toBeLessThanOrEqual(area.width);
});

test('minimize hides a window and the taskbar brings it back', async ({ page }) => {
  await bootDesktop(page);
  await openApp(page, 'projects');
  const win = page.locator('#win-projects');

  await win.locator('.wt-minimize').click();
  await expect(win).toBeHidden();

  // The taskbar is the only route back, so it has to list the window.
  const entry = page.locator('#taskbar-windows').getByRole('button').first();
  await expect(entry).toBeVisible();
  await entry.click();
  await expect(win).toBeVisible();
});

test('close removes the window', async ({ page }) => {
  await bootDesktop(page);
  await openApp(page, 'about');
  await page.locator('#win-about .wt-close').click();
  await expect(page.locator('#win-about')).toHaveCount(0);
});
