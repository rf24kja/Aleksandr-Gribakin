/**
 * Captures the showcase screenshots from the live site.
 *
 * JPEG at a modest quality on purpose: the showcase embeds every image as a
 * data URI, because a published artifact may not fetch from another host, and
 * full-resolution PNGs would put the page into the megabytes.
 *
 *   node scripts/shots.mjs [origin]
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const ORIGIN = process.argv[2] || 'https://dev24.pro';
const OUT = 'showcase/shots';

const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };

async function open(browser, { mode, lang = 'RU', theme = 'light', viewport = DESKTOP }) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: viewport === PHONE,
    hasTouch: viewport === PHONE,
    reducedMotion: 'reduce', // steady frames, no mid-animation captures
  });
  const page = await context.newPage();
  await page.goto(ORIGIN);
  await page.evaluate(([m, l, t]) => {
    localStorage.setItem('portfolio-mode', m);
    localStorage.setItem('portfolio-lang', l);
    localStorage.setItem('theme', t);
  }, [mode, lang, theme]);
  await page.goto(`${ORIGIN}/?shot=${Date.now()}`);
  await page.waitForFunction(
    (m) => document.documentElement.dataset.mode === m,
    mode,
    { timeout: 20_000 },
  );
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(2500);
  return { context, page };
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 74 });
  console.log('  ', name);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  // --- business, light ------------------------------------------------------
  {
    const { context, page } = await open(browser, { mode: 'business', theme: 'light' });
    await shot(page, 'business-light-intro');

    for (const [id, name] of [['careerOverlay', 'business-light-career'],
      ['projectsOverlay', 'business-light-projects'],
      ['achievementsOverlay', 'business-light-milestones']]) {
      const found = await page.evaluate((sectionId) => {
        const el = document.getElementById(sectionId);
        if (!el) return false;
        el.scrollIntoView({ block: 'start' });
        document.querySelectorAll('.career-item,.project-card,.achievement-item,.stat-item')
          .forEach((n) => n.classList.add('visible'));
        return true;
      }, id);
      if (found) { await page.waitForTimeout(1200); await shot(page, name); }
    }

    // A project detail, which is where the writing lives.
    await page.evaluate(() => { window.location.hash = '#/project/pg-highload'; });
    await page.waitForTimeout(1800);
    await shot(page, 'business-light-project');
    await context.close();
  }

  // --- business, dark -------------------------------------------------------
  {
    const { context, page } = await open(browser, { mode: 'business', theme: 'dark' });
    await shot(page, 'business-dark-intro');
    await context.close();
  }

  // --- desktop --------------------------------------------------------------
  {
    const { context, page } = await open(browser, { mode: 'desktop' });
    await page.locator('.desk-icon[data-app="projects"]').dblclick();
    await page.waitForTimeout(900);
    await page.locator('.desk-icon[data-app="career"]').dblclick();
    await page.waitForTimeout(1200);
    await shot(page, 'desktop-windows');
    await context.close();
  }

  // --- terminal -------------------------------------------------------------
  {
    const { context, page } = await open(browser, { mode: 'terminal' });
    const input = page.locator('.tsh-window input');
    for (const cmd of ['stats', 'projects']) {
      await input.fill(cmd);
      await input.press('Enter');
      await page.waitForTimeout(1400);
    }
    await shot(page, 'terminal-output');

    await input.fill('clear');
    await input.press('Enter');
    await page.waitForTimeout(500);
    await input.fill('open gitops');
    await input.press('Enter');
    await page.waitForTimeout(1600);
    await shot(page, 'terminal-brief');
    await context.close();
  }

  // --- phone ----------------------------------------------------------------
  for (const [mode, name] of [['business', 'phone-business'], ['terminal', 'phone-terminal'],
    ['desktop', 'phone-desktop']]) {
    const { context, page } = await open(browser, { mode, viewport: PHONE });
    if (mode === 'terminal') {
      const input = page.locator('.tsh-window input');
      await input.fill('stats');
      await input.press('Enter');
      await page.waitForTimeout(1400);
    }
    if (mode === 'desktop') {
      await page.locator('.desk-icon[data-app="achievements"]').tap();
      await page.waitForTimeout(1200);
    }
    await shot(page, name);
    await context.close();
  }

  await browser.close();
  console.log('done');
}

main().catch((err) => { console.error(err); process.exit(1); });
