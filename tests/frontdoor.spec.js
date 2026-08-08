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

test.describe('every filter is visible without scrolling', () => {
  // A filter row is a promise about how many choices there are. The toolbox's
  // row was briefly a sideways-scrolling strip: it fitted one line and hid that
  // fact, so a phone showed four of eight layers and no sign of the rest.
  // Wrapped rows are taller and honest.
  {
    test('no chip is clipped or off-screen', async ({ page }) => {
      await boot(page, 'business');
      const row = page.locator('#stackLayers');
      await row.scrollIntoViewIfNeeded();
      const bad = await row.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const out = [];
        for (const c of el.querySelectorAll('.cat-tab')) {
          const r = c.getBoundingClientRect();
          // Half a pixel of slack: sub-pixel layout rounds either way.
          if (r.right > box.right + 0.5 || r.left < box.left - 0.5) out.push(c.textContent.trim());
        }
        return { clipped: out, scrolls: el.scrollWidth > el.clientWidth + 1 };
      });
      expect(bad.clipped, `chips escaping the row: ${bad.clipped.join(', ')}`).toEqual([]);
      expect(bad.scrolls, 'the row scrolls sideways, so some chips are hidden').toBe(false);
    });
  }
});

test.describe('the toolbox filters by layer', () => {
  // The owner's fifteen areas are four languages and eleven domains, which is
  // not the axis a visitor asks along — they ask "do you do frontend". The tag
  // therefore sits on the line, and these check the narrowing is real, that it
  // is reversible, and that nothing was left unclassified.
  test('every line is classified, or the filter would drop it silently', async () => {
    const { unclassifiedLines } = await import('../src/data/stack.js');
    expect(unclassifiedLines()).toEqual([]);
  });

  test('choosing a layer narrows the areas, and All brings them back', async ({ page }) => {
    await boot(page, 'business');
    const groups = page.locator('#stackOverlay .stack-group');
    const whole = await groups.count();
    expect(whole).toBeGreaterThan(1);

    const chips = page.locator('#stackLayers .cat-tab');
    await expect(chips).toHaveCount(8); // All, plus the seven layers
    const frontend = page.locator('#stackLayers .cat-tab[data-layer="frontend"]');
    await frontend.scrollIntoViewIfNeeded();
    await frontend.click();

    const narrowed = await groups.count();
    expect(narrowed, 'the layer showed every area, so it filtered nothing').toBeLessThan(whole);
    expect(narrowed, 'the layer showed no areas at all').toBeGreaterThan(0);
    await expect(frontend).toHaveAttribute('aria-pressed', 'true');

    await chips.first().click();
    await expect(groups).toHaveCount(whole);
  });

  // JavaScript against Backend is the case the whole design exists for: the
  // area survives the filter, but only the lines that earn it do — the styling
  // and the components drop out, the server frameworks and the API layer stay.
  test('a narrowed area lists only the lines of that layer', async ({ page }) => {
    await boot(page, 'business');
    const jsGroup = () => page.locator('#stackOverlay .stack-group', { hasText: 'JavaScript' }).first();
    await jsGroup().click();
    const whole = await jsGroup().locator('.sg-line').count();

    const backend = page.locator('#stackLayers .cat-tab[data-layer="backend"]');
    await backend.scrollIntoViewIfNeeded();
    await backend.click();

    await jsGroup().click();
    const partial = await jsGroup().locator('.sg-line').count();
    expect(partial, 'filtering kept every line, so it only hid whole areas').toBeLessThan(whole);
    expect(partial, 'the area survived with no lines in it').toBeGreaterThan(0);
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

test.describe('one section about technology, one layer inside', () => {
  // The section used to carry a second layer: a "47 of them appear in the work
  // above" line with frequency bars, and the entries it counted highlighted in
  // the list. The owner removed both — the bars repeated the statistics further
  // up the page. These guard the removal rather than the feature: a highlight
  // with no legend, or a second chart of the same subject, should not come back
  // by accident.
  test('nothing above or inside the toolbox restates a fraction of it', async ({ page }) => {
    await boot(page, 'business');
    await expect(page.locator('#stackOverlay .sb-title')).toHaveCount(0);
    await expect(page.locator('#stackOverlay .sb-bars')).toHaveCount(0);
    await expect(page.locator('#stackOverlay .sg-backed')).toHaveCount(0);
    // The panel above the project grid went earlier, for the same reason.
    await expect(page.locator('.pdash-tile')).toHaveCount(0);
    await expect(page.locator('#projectsDash')).toHaveCount(0);
  });

  test('the toolbox still states its own size, computed', async ({ page }) => {
    await boot(page, 'business');
    const sub = await page.locator('#stackOverlay .section-sub').innerText();
    const { stackToolCount } = await import('../src/data/stack.js');
    expect(sub, `sub-line does not carry the tool count: ${sub}`)
      .toContain(String(stackToolCount()));
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
