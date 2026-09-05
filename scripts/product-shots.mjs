/**
 * Captures a card image for each of the owner's own products.
 *
 * Reads the URLs from src/data/products.js rather than taking them on the
 * command line, so the picture on a card and the entry behind it cannot end up
 * describing two different sites.
 *
 *   node scripts/product-shots.mjs
 *
 * Writes public/products/<shot>, which the build copies to the site root. JPEG
 * at the same quality the showcase uses: these are 16:10 cards a few hundred
 * pixels wide on the page, and a PNG of a full desktop viewport is a megabyte
 * spent on something nobody zooms into.
 *
 * Runs against the live sites, so it needs a machine that can reach them.
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

import { PRODUCTS, incompleteProducts } from '../src/data/products.js';

const OUT = 'public/products';
const VIEW = { width: 1280, height: 800 };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
let taken = 0;

for (const p of PRODUCTS) {
  if (!p.url || !p.shot) continue;
  const context = await browser.newContext({
    viewport: VIEW,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce', // steady frames, no mid-animation captures
  });
  const page = await context.newPage();
  try {
    await page.goto(p.url, { waitUntil: 'load', timeout: 45_000 });
    // Give lazy-loaded hero media a moment; a card of grey placeholders is
    // worse than no card.
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${p.shot}`, type: 'jpeg', quality: 74 });
    console.log(`${OUT}/${p.shot}  ←  ${p.url}`);
    taken += 1;
  } catch (e) {
    console.error(`FAILED  ${p.url} — ${e.message.split('\n')[0]}`);
  }
  await context.close();
}
await browser.close();
console.log(`\n${taken} of ${PRODUCTS.length} captured.`);

// A picture is not enough to publish an entry, and saying so here is cheaper
// than wondering later why the section is still empty.
const pending = incompleteProducts();
if (pending.length) {
  console.log('\n  Still not publishable — the section stays hidden until these are filled in:');
  for (const p of pending) console.log(`    ${p.id}: ${p.missing.join(', ')}`);
  console.log('  Edit src/data/products.js.');
}
