import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

import PONYTAIL from '../src/config/ponytail.config.js';

/**
 * The interface has to be fully translated, and the settings panel has to work.
 *
 * The settings popup shipped half-translated: its five option buttons carried
 * their English labels directly in the markup with no data-i18n attribute, so a
 * Russian visitor opened Settings and read "Dark / Light / Business / Desktop /
 * Terminal". The translations existed in the config the whole time — nothing
 * pointed at them. Four more keys were referenced by the markup and defined in
 * neither locale, which silently falls back to the English written in the HTML.
 */

const resolve = (locale, key) => key.split('.').reduce((o, k) => o?.[k], locale);

test('every data-i18n key in the markup exists in both locales', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const keys = [...new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]))];
  expect(keys.length).toBeGreaterThan(20);

  const missing = [];
  for (const key of keys) {
    for (const lang of ['EN', 'RU']) {
      if (typeof resolve(PONYTAIL.LOCALE[lang], key) !== 'string') missing.push(`${lang}: ${key}`);
    }
  }
  expect(missing).toEqual([]);
});

test('the two locales define the same keys', () => {
  const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) return flatten(v, path);
    return [path];
  });
  const en = new Set(flatten(PONYTAIL.LOCALE.EN));
  const ru = new Set(flatten(PONYTAIL.LOCALE.RU));
  expect([...en].filter((k) => !ru.has(k))).toEqual([]);
  expect([...ru].filter((k) => !en.has(k))).toEqual([]);
});

test('the settings panel opens, is translated, and switches theme', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('portfolio-mode', 'business');
    localStorage.setItem('portfolio-lang', 'RU');
    // Pinned so the assertion below has a known starting point: clicking "dark"
    // while already dark changes nothing, and under parallel load the boot
    // sequence could still be settling when the theme was read.
    localStorage.setItem('theme', 'light');
  });
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru', { timeout: 15_000 });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.locator('#settingsGear').click();
  const popup = page.locator('#settingsPopup');
  await expect(popup).toBeVisible();

  // No English left on screen in the Russian interface.
  const labels = await popup.locator('.settings-opt, .settings-close, .settings-label').allInnerTexts();
  const english = labels.filter((t) => /\b(Dark|Light|Business|Desktop|Terminal|Close|Theme|Interface)\b/.test(t));
  expect(english).toEqual([]);

  await popup.locator('[data-stheme="dark"]').click();
  // Generous: with the suite at full width this assertion competed with ten
  // other browsers for CPU and the default five seconds was occasionally short.
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 15_000 });
});

test('the settings options each get a full row rather than wrapping', async ({ page }) => {
  // On a phone the three interface options broke 2 + 1: "Рабочий стол" does not
  // fit beside two siblings in a 360px card, leaving one button stranded.
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('portfolio-mode', 'business');
    localStorage.setItem('portfolio-lang', 'RU');
  });
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru', { timeout: 15_000 });

  await page.locator('#settingsGear').click();
  const popup = page.locator('#settingsPopup');
  await expect(popup).toBeVisible();
  // Measure after the card has its own opaque ground, otherwise the panel can
  // still be laying out and the rows have not settled into place.
  await expect
    .poll(async () => page.locator('.settings-card').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    ), { timeout: 10_000 })
    .not.toMatch(/rgba\(0, 0, 0, 0\)/);
  await page.waitForTimeout(250);

  const tops = await popup.locator('.settings-mode-group .settings-opt')
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(tops.length).toBe(3);
  // One row each: three distinct offsets, none shared.
  expect(new Set(tops).size).toBe(3);

  const widths = await popup.locator('.settings-mode-group .settings-opt')
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(new Set(widths).size, 'every option is the same width').toBe(1);
});

test('the desktop settings window is translated too', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('portfolio-mode', 'desktop');
    localStorage.setItem('portfolio-lang', 'RU');
  });
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'desktop', { timeout: 15_000 });

  await page.locator('.desk-icon[data-app="settings"]').dblclick();
  const win = page.locator('#win-settings');
  await expect(win).toBeVisible();

  // The heading read "Mode" and the buttons capitalised the raw mode id, so
  // this window stayed English however the site was set.
  const text = await win.innerText();
  expect(text).not.toMatch(/\bMode\b/);
  expect(text).not.toMatch(/\bBusiness\b|\bDesktop\b|\bTerminal\b/);
  expect(text).toMatch(/Бизнес/);
  expect(text).toMatch(/Терминал/);
});

test('overlays that start hidden are still readable when opened', async ({ page }) => {
  // The contrast sweep skipped anything display:none, so the settings panel was
  // never measured. It was styled from the 3D palette while the light theme
  // repainted the card white underneath: near-white text on white, close to
  // 1:1, which is what "текст слабочитаем" meant.
  for (const theme of ['light', 'dark']) {
    await page.goto('/');
    await page.evaluate((t) => {
      localStorage.setItem('portfolio-mode', 'business');
      localStorage.setItem('portfolio-lang', 'RU');
      localStorage.setItem('theme', t);
    }, theme);
    await page.goto(`/?t=${Date.now()}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme, { timeout: 15_000 });

    await page.locator('#settingsGear').click();
    await expect(page.locator('#settingsPopup')).toBeVisible();
    // Measure only once the card has an opaque background of its own. Under
    // parallel load the panel can be visible while the theme's styles are still
    // resolving, and comparing against a transparent card reports contrast that
    // no one will ever see.
    await expect
      .poll(async () => page.locator('.settings-card').evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      ))
      .not.toMatch(/rgba\(0, 0, 0, 0\)/);
    await page.waitForTimeout(250);

    const failures = await page.evaluate(() => {
      const lum = (r, g, b) => {
        const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const parse = (v) => {
        const m = String(v).match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(',').map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const card = document.querySelector('.settings-card');
      const bg = parse(getComputedStyle(card).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
      const bad = [];
      card.querySelectorAll('*').forEach((el) => {
        const text = [...el.childNodes].filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim()).join(' ').trim();
        if (text.length < 2) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const fg = parse(cs.color);
        if (!fg) return;
        const a = (fg.a ?? 1) * (parseFloat(cs.opacity) || 1);
        const eff = {
          r: fg.r * a + bg.r * (1 - a),
          g: fg.g * a + bg.g * (1 - a),
          b: fg.b * a + bg.b * (1 - a),
        };
        const L1 = lum(eff.r, eff.g, eff.b);
        const L2 = lum(bg.r, bg.g, bg.b);
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize);
        const need = size >= 24 ? 3 : 4.5;
        if (ratio < need) bad.push(`${text.slice(0, 22)} = ${ratio.toFixed(2)}:1 @${size}px`);
      });
      return bad;
    });
    expect(failures, `unreadable text in the ${theme} settings panel`).toEqual([]);
  }
});
