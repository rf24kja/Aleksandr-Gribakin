import { expect, test } from '@playwright/test';

/**
 * Every control is clicked, and every click has to change something.
 *
 * Two defects reached production because the checks before this one stopped
 * short. The homepage CTA inherited pointer-events: none and swallowed clicks
 * while still looking and hovering like a button — nothing that measures colour
 * or size notices that. Then desktop Settings resolved its labels once at
 * registration, so switching language changed <html lang>, persisted the
 * choice, and left every label in English: the control was reachable, the
 * handler ran, and the visitor saw no effect.
 *
 * So reachability is necessary but not sufficient. These tests assert the
 * observable consequence.
 */

const MODES = ['business', 'desktop', 'terminal'];

/**
 * Loads the site in a known mode and language, waiting for the app to render.
 *
 * The preference is written straight to localStorage rather than through an
 * init script: init scripts accumulate across calls and would also re-seed the
 * language on every reload, which is precisely what the persistence test needs
 * to observe.
 */
async function boot(page, { mode = 'business', lang = null, path = '/' } = {}) {
  if (!page.url().startsWith('http')) await page.goto('/');
  await page.evaluate(([m, l]) => {
    localStorage.setItem('portfolio-mode', m);
    if (l) localStorage.setItem('portfolio-lang', l);
    else localStorage.removeItem('portfolio-lang');
  }, [mode, lang]);

  // A cache-buster forces a real navigation even when the path is unchanged.
  const [base, hash] = path.split('#');
  const sep = base.includes('?') ? '&' : '?';
  await page.goto(`${base}${sep}t=${Date.now()}${hash ? `#${hash}` : ''}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode, { timeout: 15_000 });
  await page.waitForTimeout(1200);
}

/**
 * Opens a desktop app the way the interface expects.
 *
 * Desktop mode follows the desktop metaphor: double-click with a mouse, single
 * tap on a touch screen. A double-click satisfies both — on touch the first of
 * the two clicks already opens it.
 */
async function openDesktopApp(page, id) {
  const icon = page.locator(`.desk-icon[data-app="${id}"]`);
  // A single tap opens on touch; a mouse needs the desktop's double-click. Using
  // dblclick on touch sends a second tap into whatever the first one opened.
  if (page.viewportSize().width <= 768) await icon.tap();
  else await icon.dblclick();
}

/**
 * Elements that draw as controls but cannot receive a click, because something
 * else sits on top of their own centre or pointer events are switched off.
 */
async function unreachableControls(page) {
  return page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const found = [];
    const seen = new Set();
    const scan = () => {
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea,'
        + ' [role="button"], [data-scroll-to], [data-cmd], [data-run], [data-app]';
      document.querySelectorAll(sel).forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.left < -500) return;                      // the form's honeypot
        if (r.bottom < 0 || r.top > innerHeight) return;
        const x = Math.round(r.left + r.width / 2);
        const y = Math.round(r.top + r.height / 2);
        if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) return;
        const top = document.elementFromPoint(x, y);
        const reachable = !!top && (el.contains(top) || top === el);
        if (reachable && cs.pointerEvents !== 'none') return;
        const key = `${el.className}|${(el.textContent || '').trim().slice(0, 16)}`;
        if (seen.has(key)) return;
        seen.add(key);
        found.push({
          control: `${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]}`,
          text: (el.textContent || '').trim().slice(0, 24),
          pointerEvents: cs.pointerEvents,
          coveredBy: top ? `${top.tagName.toLowerCase()}#${top.id || ''}.${String(top.className || '').split(' ')[0]}` : 'nothing',
        });
      });
    };
    for (let y = 0; y <= document.body.scrollHeight; y += Math.round(innerHeight * 0.8)) {
      window.scrollTo(0, y);
      await wait(160);
      scan();
    }
    window.scrollTo(0, 0);
    return found;
  });
}

for (const mode of MODES) {
  test(`${mode}: every control can be clicked`, async ({ page }) => {
    await boot(page, { mode });
    expect(await unreachableControls(page)).toEqual([]);
  });
}

test('business: the CTA reaches the contact form', async ({ page }) => {
  await boot(page, { mode: 'business' });
  const cta = page.locator('.intro-cta');
  await expect(cta).toBeVisible();
  // Playwright's actionability check fails here if anything covers the button,
  // which is exactly how the pointer-events regression shipped.
  await cta.click({ timeout: 5_000 });
  await expect(page.locator('[data-form="consult"]')).toBeInViewport({ timeout: 5_000 });
});

test('an anchor with no target never shows the 404 wall', async ({ page }) => {
  // The CTA leaves #ctaSection in the URL. In a mode without that element the
  // router used to treat it as a dead route and cover everything with #page404.
  for (const mode of ['terminal', 'desktop']) {
    await boot(page, { mode, path: '/#ctaSection' });
    await expect(page.locator('#page404')).toBeHidden();
  }
});

test('desktop: settings change the language of what is on screen', async ({ page }) => {
  await boot(page, { mode: 'desktop', lang: 'EN' });
  // Settings is the shared panel now, not a window of its own.
  await openDesktopApp(page, 'settings');
  await expect(page.locator('#settingsPopup')).toBeVisible();

  const labelsBefore = await page.locator('.desk-icon-label').allInnerTexts();
  await page.locator('#settingsPopup [data-slang="RU"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru', { timeout: 15_000 });

  // The setting has to be visible in the interface, not only in an attribute.
  await expect
    .poll(async () => (await page.locator('.desk-icon-label').allInnerTexts()).join('|'))
    .not.toBe(labelsBefore.join('|'));
});

test('desktop: settings switch mode', async ({ page }) => {
  await boot(page, { mode: 'desktop' });
  await openDesktopApp(page, 'settings');
  await expect(page.locator('#settingsPopup')).toBeVisible();
  await page.locator('#settingsPopup [data-smode="terminal"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'terminal', { timeout: 15_000 });
});

test('desktop: apps open from the keyboard', async ({ page }) => {
  await boot(page, { mode: 'desktop' });
  const icon = page.locator('.desk-icon[data-app="projects"]');
  await icon.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#desktop-windows').locator('*').first()).toBeVisible();
});

test('terminal: a command chip runs its command', async ({ page }) => {
  await boot(page, { mode: 'terminal' });
  await page.locator('.tsh-chip[data-cmd="whoami"]').click();
  await expect(page.locator('.tsh-log')).toContainText(/whoami/i);
});

test('the language toggle changes the page, and the choice survives a reload', async ({ page }) => {
  await boot(page, { mode: 'business', lang: 'EN' });
  const before = await page.locator('.bio').innerText();
  await page.locator('.lang-toggle').first().click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect.poll(async () => page.locator('.bio').innerText()).not.toBe(before);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

test('the contact form reports a real outcome', async ({ page }) => {
  await boot(page, { mode: 'business' });
  const form = page.locator('[data-form="consult"]');
  await form.locator('[name=name]').fill('Playwright Check');
  await form.locator('[name=email]').fill(`ci-${Date.now()}@example.com`);
  await form.locator('[name=message]').fill('Automated check of the contact path.');
  await form.locator('[type=submit]').click();

  // Against a preview server /api/consult does not exist, so the endpoint fails
  // and the form must say so. What must never happen is silence: before this
  // was fixed, a dropped message produced no success and no error at all.
  await expect(
    form.locator('[data-form-success], [data-form-errors]').filter({ hasText: /\S/ }).first(),
  ).toBeVisible({ timeout: 15_000 });
});

test('prerendered HTML carries the content, not just a shell', async ({ page }) => {
  const res = await page.request.get('/ru/');
  expect(res.status()).toBe(200);
  const html = await res.text();
  // Rendered by JavaScript only, this was 164 words of stale placeholder copy.
  expect(html).toContain('lang="ru"');
  expect(html).toContain('<link rel="canonical" href="https://dev24.pro/ru"');
  expect(html).toMatch(/Kubernetes/);
  expect(html.match(/<a class="project-card/g) || []).toHaveLength(17);
  // Claims removed from the site must not survive in the served markup.
  expect(html).not.toMatch(/ML fraud detection|Omnimesh/);
});

test('the consult endpoint answers directly, with no redirect in the way', async ({ request }) => {
  // trailingSlash once rewrote /api/consult to /api/consult/ with a 308. A
  // browser follows that and keeps the body, so submissions still arrived, but
  // an extra hop sat on the one path that carries a lead — and any client that
  // does not follow redirects got "Redirecting..." instead of the endpoint.
  const res = await request.get('/api/consult', { maxRedirects: 0, failOnStatusCode: false });
  // What the status is depends on the environment — the preview server has no
  // serverless functions at all. What matters is that nothing redirects.
  expect([301, 302, 307, 308]).not.toContain(res.status());
});

test('the gear announces itself without becoming unclickable', async ({ page }) => {
  // It span forever, which was motion nobody asked for and left the control
  // geometrically unstable — a rotating box changes its own bounds every frame.
  // Removing it entirely lost the only cue that this is a control. So the glyph
  // inside turns, briefly, and the button it sits in never moves.
  await boot(page, { mode: 'business' });
  const gear = page.locator('#settingsGear');
  const glyph = gear.locator('.gear-glyph');

  const anim = await glyph.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { name: cs.animationName, count: cs.animationIterationCount, duration: cs.animationDuration };
  });
  expect(anim.name).not.toBe('none');
  // Bounded: a permanent animation keeps a compositor layer alive for the life
  // of the page and stops being a cue after the first look.
  expect(anim.count).not.toBe('infinite');

  // The button's own size must not change while the glyph turns. Its position
  // legitimately can — the gear sits inside the <h1>, and a webfont swapping in
  // reflows that line — so only the dimensions are asserted here.
  await page.evaluate(() => document.fonts?.ready);
  const sizes = [];
  for (let i = 0; i < 5; i += 1) {
    const b = await gear.boundingBox();
    sizes.push([Math.round(b.width), Math.round(b.height)].join('x'));
    await page.waitForTimeout(120);
  }
  expect(new Set(sizes).size, `the button must not resize while the glyph turns: ${sizes.join(' | ')}`).toBe(1);

  // The real guard. With the old animation on the button itself, Playwright
  // waited for the element to hold still, retried 54 times and gave up — the
  // control was never clickable by anything that checks before acting.
  await gear.click({ timeout: 5_000 });
  await expect(page.locator('#settingsPopup')).toBeVisible();
});
