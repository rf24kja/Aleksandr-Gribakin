import { expect, test } from '@playwright/test';

/**
 * The first paint and the path to a message, guarded.
 *
 * The page used to link a stylesheet on fonts.googleapis.com from <head>, which
 * meant the first paint waited on a third party: measured here, 96ms when the
 * request was cut immediately and no paint at all while it hung. Advertising
 * pays for these arrivals and the audience is largely in Russia, where that
 * host is not something to bet a white screen on.
 *
 * The form was the other half: three labels drawn above their fields and
 * attached to none of them, so a screen reader announced unnamed boxes.
 */

const MODES = ['business', 'desktop', 'terminal'];

// WCAG 2.2 target size (minimum). The contact links are held to 44 in
// reach.spec.js; these are links inside running text, where 24 is the bar.
const MIN_INLINE_TAP = 24;

async function boot(page, mode = 'business', lang = 'EN') {
  await page.goto('/');
  await page.evaluate(([m, l]) => {
    localStorage.setItem('portfolio-mode', m);
    localStorage.setItem('portfolio-lang', l);
  }, [mode, lang]);
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode, { timeout: 15_000 });
  await page.waitForTimeout(900);
}

test.describe('nothing outside this origin holds up the first paint', () => {
  for (const mode of MODES) {
    test(`${mode}: no stylesheet or font is fetched from a third party`, async ({ page }) => {
      const foreign = [];
      page.on('request', (r) => {
        const url = r.url();
        if (url.startsWith('http://localhost') || url.startsWith('data:')) return;
        // The analytics tag is deliberate, disclosed in the privacy policy, and
        // loads async — it cannot hold up a paint. Everything else is a finding.
        if (url.includes('googletagmanager.com')) return;
        if (['stylesheet', 'font', 'document', 'script'].includes(r.resourceType())) {
          foreign.push(`${r.resourceType()} ${url}`);
        }
      });
      await boot(page, mode);
      await page.waitForTimeout(1200);
      expect(foreign, `render path reaches outside this origin:\n${foreign.join('\n')}`).toEqual([]);
    });
  }

  // Every mode, because each dresses the same content differently and a weight
  // that only the desktop shell asks for is still a weight somebody sees.
  for (const mode of MODES) {
    test(`${mode}: the faces the page asks for are the faces it ships`, async ({ page }) => {
      await boot(page, mode);
      const missing = await facesMissing(page);
      // Ubuntu is the exception the survey turned up: the CSS asks for 600 and
      // the family has no 600 — 400, 500 and 700 are all Google publishes. The
      // browser picks a neighbour, exactly as it did before these files were
      // brought in-house.
      const real = missing.filter((m) => m !== 'Ubuntu|normal|600');
      expect(real, `weights ${mode} uses but does not ship: ${real.join(', ')}`).toEqual([]);
    });
  }
});

function facesMissing(page) {
  return page.evaluate(() => {
    const FAMILIES = ['Inter', 'JetBrains Mono', 'Playfair Display', 'Ubuntu'];

    // What the stylesheet declares. Not document.fonts.check(): that answers
    // "is this face loaded", and a face used only by the mode currently hidden
    // is never loaded however correctly it is shipped.
    const declared = [];
    for (const face of document.fonts) {
      const [lo, hi = lo] = face.weight.split(/\s+/).map(Number);
      declared.push({ family: face.family.replace(/["']/g, ''), style: face.style, lo, hi });
    }

    const wanted = new Set();
    for (const el of document.querySelectorAll('*')) {
      if (!(el.textContent || '').trim()) continue;
      const cs = getComputedStyle(el);
      const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (!FAMILIES.includes(family)) continue;
      wanted.add(`${family}|${cs.fontStyle}|${cs.fontWeight}`);
    }

    return [...wanted].filter((w) => {
      const [family, style, weight] = w.split('|');
      return !declared.some((d) => d.family === family && d.style === style
        && +weight >= d.lo && +weight <= d.hi);
    });
  });
}

test.describe('a font is fetched once and then remembered', () => {
  test('every font address carries a fingerprint of its contents', async ({ page }) => {
    await boot(page, 'business');
    const { urls, unhashed } = await page.evaluate(() => {
      const found = [...document.querySelectorAll('style')]
        .flatMap((s) => [...s.textContent.matchAll(/url\('(\/fonts\/[^']+)'\)/g)].map((m) => m[1]));
      return { urls: found, unhashed: found.filter((u) => !/\.[0-9a-f]{8}\.woff2$/.test(u)) };
    });
    expect(urls.length, 'no font URLs in the document at all').toBeGreaterThan(10);
    expect(unhashed, `font URLs with no content hash: ${unhashed.join(', ')}`).toEqual([]);
  });

  test('the cache promise and the fingerprint are declared together', async () => {
    // Read rather than requested: the header is Vercel's to apply and cannot be
    // seen from `vite preview`. What a test can hold is the pair — a year of
    // `immutable` is only honest while the names change with the bytes, and the
    // test above is what keeps that true.
    const { readFile } = await import('node:fs/promises');
    const cfg = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
    const rule = cfg.headers.find((h) => h.source.startsWith('/fonts/'));
    expect(rule, 'vercel.json declares no cache rule for /fonts/').toBeTruthy();
    const cache = rule.headers.find((h) => h.key.toLowerCase() === 'cache-control');
    expect(cache.value).toMatch(/immutable/);
    expect(cache.value).toMatch(/max-age=\d{7,}/);
  });
});

test.describe('the form can be filled by someone who cannot see it', () => {
  test('every field carries a name of its own', async ({ page }) => {
    await boot(page, 'business');
    const unnamed = await page.evaluate(() => {
      const form = document.querySelector('[data-form="consult"]');
      return [...form.querySelectorAll('input, textarea')]
        .filter((el) => el.type !== 'hidden' && el.getAttribute('aria-hidden') !== 'true')
        .filter((el) => {
          if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false;
          if (el.id && form.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false;
          return !el.closest('label');
        })
        .map((el) => el.getAttribute('name'));
    });
    expect(unnamed, `fields with no label: ${unnamed.join(', ')}`).toEqual([]);
  });

  test('the label actually moves focus into its field', async ({ page }) => {
    await boot(page, 'business');
    await page.locator('label[for="cf-email"]').click();
    expect(await page.evaluate(() => document.activeElement?.getAttribute('name'))).toBe('email');
  });

  test('the honeypot is not announced as a fourth question', async ({ page }) => {
    await boot(page, 'business');
    await expect(page.locator('input[name="_website"]')).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe('the page names its own parts', () => {
  test('skip-to-content has somewhere to land', async ({ page }) => {
    await boot(page, 'business');
    const target = page.locator('#mainContent');
    await expect(target).toHaveAttribute('role', 'main');
    const href = await page.locator('a.skip-link').getAttribute('href');
    expect(href).toBe('#mainContent');
  });

  test('the policy link is big enough to hit in the row that requires it', async ({ page }) => {
    await boot(page, 'business');
    const link = page.locator('.consent-row a').first();
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    expect(box.height, `consent policy link is ${Math.round(box.height)}px tall`)
      .toBeGreaterThanOrEqual(MIN_INLINE_TAP);
  });
});

test.describe('the toolbox is the same list in every mode', () => {
  // 275 names, and the number in the copy is computed from the data rather than
  // typed into it — the project's first rule, applied one level down.
  const SAMPLE = ['Temporal', 'Qdrant', 'Traefik', 'ccxt', 'Keycloak'];

  test('business folds it shut and opens on demand', async ({ page }) => {
    await boot(page, 'business');
    const groups = page.locator('#stackOverlay .stack-group');
    await expect(groups).toHaveCount(15);
    expect(await groups.first().evaluate((d) => d.open)).toBe(false);
    await groups.first().locator('summary').click();
    await expect(groups.first().locator('.sg-item').first()).toBeVisible();
  });

  test('desktop has an app for it', async ({ page }) => {
    await boot(page, 'desktop');
    const icon = page.locator('.desk-icon[data-app="tools"]');
    await expect(icon).toHaveCount(1);
    await icon.dblclick();
    const win = page.locator('.desk-window').first();
    await expect(win).toBeVisible();
    for (const name of SAMPLE) await expect(win).toContainText(name);
  });

  test('the terminal lists the areas and opens one', async ({ page }) => {
    await boot(page, 'terminal');
    await expect(page.locator('.tsh-window')).toBeVisible({ timeout: 15_000 });
    const input = page.locator('.tsh-window input');
    await input.fill('tools');
    await input.press('Enter');
    await expect.poll(async () => page.locator('.tsh-log').innerText(), { timeout: 10_000 })
      .toContain('security');
    await input.fill('tools security');
    await input.press('Enter');
    // The framing sentence travels with the group, in both languages.
    await expect.poll(async () => page.locator('.tsh-log').innerText(), { timeout: 10_000 })
      .toMatch(/under contract|по договору/i);
  });

  test('the count in the copy is the count in the data', async ({ page }) => {
    await boot(page, 'business');
    const sub = await page.locator('#stackOverlay .section-sub').innerText();
    const claimed = Number(sub.match(/\d+/)?.[0]);
    const counted = await page.evaluate(() => new Set(
      [...document.querySelectorAll('#stackOverlay .sg-item')].map((e) => e.textContent.trim()),
    ).size);
    expect(claimed).toBe(counted);
  });
});

test.describe('one section about technology, two layers inside', () => {
  test('the toolbox marks what has work behind it, and counts it', async ({ page }) => {
    await boot(page, 'business');
    const counts = await page.evaluate(async () => {
      for (const d of document.querySelectorAll('#stackOverlay .stack-group')) d.open = true;
      const all = [...document.querySelectorAll('#stackOverlay .sg-item')];
      return {
        total: new Set(all.map((e) => e.textContent.trim())).size,
        backed: new Set(all.filter((e) => e.classList.contains('sg-backed'))
          .map((e) => e.textContent.trim())).size,
        claimed: Number(document.querySelector('#stackOverlay .sb-title')
          ?.textContent.match(/\d+/)?.[0]),
      };
    });
    // The lower layer is a subset of the upper one, and the sentence says so
    // with the same number the markup carries.
    expect(counts.backed).toBe(counts.claimed);
    expect(counts.backed).toBeLessThan(counts.total);
    expect(counts.backed).toBeGreaterThan(0);
  });

  test('the dashboard tile reads as a part of the whole', async ({ page }) => {
    await boot(page, 'business');
    const tile = await page.locator('.pdash-tile', { hasText: /инструментар|toolbox/i }).first().innerText()
      .catch(() => page.locator('#projectsOverlay').innerText());
    const pair = tile.match(/(\d+)\s*\/\s*(\d+)/);
    expect(pair, `no "N/M" in the technologies tile: ${tile.slice(0, 120)}`).toBeTruthy();
    const [, part, whole] = pair.map(Number);
    expect(part).toBeLessThanOrEqual(whole);
  });

  test('every technology named in the work exists in the toolbox', async () => {
    // The invariant behind "N of M": if a case names something the toolbox
    // does not carry, the fraction stops being arithmetic and starts being a
    // claim. Checked in both languages, since the lists are translated apart.
    const [{ default: PONYTAIL }, stats, stack] = await Promise.all([
      import('../src/config/ponytail.config.js'),
      import('../src/lib/stats.js'),
      import('../src/data/stack.js'),
    ]);
    for (const lang of ['EN', 'RU']) {
      const labels = stats.techFrequency(PONYTAIL.LOCALE[lang].PROJECTS).map((f) => f.label);
      const missing = stack.unmatchedWorkTech(labels);
      expect(missing, `${lang}: named in the work, absent from the toolbox: ${missing.join(', ')}`)
        .toEqual([]);
    }
  });
});
