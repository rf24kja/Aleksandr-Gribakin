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
  });
  await page.goto(`/?t=${Date.now()}`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru', { timeout: 15_000 });

  await page.locator('#settingsGear').click();
  const popup = page.locator('#settingsPopup');
  await expect(popup).toBeVisible();

  // No English left on screen in the Russian interface.
  const labels = await popup.locator('.settings-opt, .settings-close, .settings-label').allInnerTexts();
  const english = labels.filter((t) => /\b(Dark|Light|Business|Desktop|Terminal|Close|Theme|Interface)\b/.test(t));
  expect(english).toEqual([]);

  const before = await page.getAttribute('html', 'data-theme');
  await popup.locator('[data-stheme="dark"]').click();
  await expect
    .poll(async () => page.getAttribute('html', 'data-theme'))
    .not.toBe(before);
});
