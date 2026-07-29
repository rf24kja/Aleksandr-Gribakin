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
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
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
