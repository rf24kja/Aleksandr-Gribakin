/**
 * Pulls the web fonts into the repository and writes their @font-face rules
 * into index.html.
 *
 * The site used to link a stylesheet on fonts.googleapis.com from <head>. That
 * link is render-blocking, so the first paint waited on a third party: measured
 * here, first contentful paint was 96ms when the request was cut immediately
 * and never arrived at all while it hung. For an audience in Russia, reached
 * through paid advertising, a white screen that depends on Google's reachability
 * is not a trade worth making. Serving the files from our own origin also means
 * no visitor's address reaches a third party, which is what the privacy policy
 * already implies by listing only GA4 and Vercel.
 *
 * What is fetched is measured, not guessed. scripts/ has no browser, so the
 * list below comes from walking all three modes in both languages and reading
 * the computed family and weight off every element that carries text. Two
 * things that survey found:
 *
 *   - four requested faces were never used (JetBrains Mono 600, Playfair
 *     Display 600 and 700, Ubuntu 300) — downloaded on every visit, drawn on
 *     none of them;
 *   - five used faces were never requested (Inter 400 and its italic,
 *     JetBrains Mono 500, Playfair Display 500, Ubuntu 600), so the browser
 *     substituted a neighbouring weight and skewed its own italic. Body text
 *     was rendering at a weight nobody chose.
 *
 * Variable fonts settle that argument: one file per family covers the whole
 * range, so a weight cannot be missing again. Ubuntu has no variable version
 * and ships as the three static weights it actually uses.
 *
 * Run `npm run fonts` after changing the families below.
 */
import { mkdir, writeFile, readFile, readdir, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'fonts');
const INDEX = join(ROOT, 'index.html');

const START = '<!-- fonts:start -->';
const END = '<!-- fonts:end -->';

// A browser UA, or the API answers with .ttf instead of the far smaller .woff2.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Greek and Vietnamese are dropped: this site is English and Russian, and a
// subset nobody's text falls into is a file nobody ever downloads. latin-ext
// stays for the client names — Engel & Völkers, Tzu Chi.
const SUBSETS = new Set(['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']);

const QUERY = [
  'Inter:ital,wght@0,200..600;1,400',
  'JetBrains+Mono:ital,wght@0,300..700;1,400',
  // 400..700, not the 400..500 the first survey suggested: the survey walked a
  // page in one state, and a heading at 700 turned up only once tests looked at
  // all three modes. A range costs nothing a single weight does not.
  'Playfair+Display:ital,wght@0,400..700;1,400',
  'Ubuntu:wght@400;500;700',
].map((f) => `family=${f}`).join('&');

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Splits the API's answer into its subset-commented @font-face blocks. */
function blocks(css) {
  const out = [];
  const re = /\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
  let m;
  while ((m = re.exec(css)) !== null) out.push({ subset: m[1], body: m[2] });
  return out;
}

const field = (body, name) => body.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

async function main() {
  const url = `https://fonts.googleapis.com/css2?${QUERY}&display=swap`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Google Fonts answered ${res.status}`);
  const css = await res.text();

  await mkdir(OUT_DIR, { recursive: true });
  // Start from empty so a family removed above does not leave its file behind.
  for (const f of await readdir(OUT_DIR).catch(() => [])) {
    if (f.endsWith('.woff2')) await unlink(join(OUT_DIR, f));
  }

  const rules = [];
  let bytes = 0;
  let skipped = 0;

  for (const { subset, body } of blocks(css)) {
    if (!SUBSETS.has(subset)) { skipped++; continue; }

    const family = field(body, 'font-family').replace(/['"]/g, '');
    const style = field(body, 'font-style');
    const weight = field(body, 'font-weight');
    const range = field(body, 'unicode-range');
    const src = body.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1];
    if (!src) continue;

    const name = `${slug(family)}-${style}-${weight.replace(/\s+/g, '_')}-${subset}.woff2`;
    const file = await fetch(src, { headers: { 'User-Agent': UA } });
    if (!file.ok) throw new Error(`${name}: ${file.status}`);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(join(OUT_DIR, name), buf);
    bytes += buf.length;

    rules.push(`    @font-face {
      font-family: '${family}';
      font-style: ${style};
      font-weight: ${weight};
      font-display: swap;
      src: url('/fonts/${name}') format('woff2');
      unicode-range: ${range};
    }`);
  }

  const generated = [
    START,
    '  <style>',
    '    /* Generated by scripts/fonts.mjs — run `npm run fonts` to refresh.',
    '       Inlined rather than linked: a stylesheet of its own would be one more',
    '       render-blocking request, and the whole point of this block is that the',
    '       first paint waits for nothing. unicode-range keeps a visitor reading',
    '       English from ever fetching the Cyrillic cut, and the other way round. */',
    ...rules,
    '  </style>',
    END,
  ].join('\n');

  const html = await readFile(INDEX, 'utf8');
  const from = html.indexOf(START);
  const to = html.indexOf(END);
  if (from === -1 || to === -1) {
    throw new Error(`index.html carries no ${START} … ${END} markers to write into`);
  }
  await writeFile(INDEX, html.slice(0, from) + generated + html.slice(to + END.length), 'utf8');

  console.log(`fonts: ${rules.length} faces, ${(bytes / 1024).toFixed(0)} KB in public/fonts, `
    + `${skipped} faces skipped as unused subsets`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
