/**
 * The CV, built from the site rather than typed beside it.
 *
 * `dev24-portfolio-*.pdf` presents the website — its three modes, its
 * screenshots, how it was made. That is a different document from a CV, and it
 * carries none of the things a reader hiring an engineer looks for first: what
 * he can work with, for whom, and what changed as a result.
 *
 * Everything below is read from the same modules the site renders from, so a
 * CV cannot claim a case, a figure or a tool the site does not. That is the
 * project's first rule applied to the one document people fact-check hardest.
 *
 *   node reference/resume.mjs
 *
 * Writes reference/dev24-resume-en.pdf and, beside it, the print source.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

import PONYTAIL from '../src/config/ponytail.config.js';
import { webProjects } from '../src/data/webProjects.js';
import { stackGroups, stackToolCount } from '../src/data/stack.js';
import { CONTACTS } from '../src/data/process.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const L = PONYTAIL.LOCALE.EN;

const esc = (s) => String(s ?? '')
  .replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The one number a case is best summarised by: a before/after pair beats a
 * bare "after", because a figure with nothing to compare it against is not
 * evidence of anything. Ranges are printed as the data stores them.
 */
function headlineMetric(item) {
  // Units attach tightly when they are symbols and loosely when they are words:
  // "2.8s → 0.6s" reads, "1.8pages → 4.1pages" does not. Written once, at the
  // end, because a unit repeated on both sides of an arrow is noise.
  // Symbols and bare punctuation ride the number ("50+", "91%"); words do not.
  const symbol = (u) => !!u && (/^(%|s|ms|min|h|kb|mb)$/i.test(u) || !/[a-z]/i.test(u));
  const withUnit = (value, unit) => {
    if (!unit) return String(value);
    return symbol(unit) ? `${value}${unit}` : `${value} ${unit}`;
  };
  const show = (m) => {
    const b = m.beforeText ?? m.before;
    const a = m.afterText ?? m.after;
    // A symbol rides both numbers; a word is written once, after the pair.
    return symbol(m.unit) || !m.unit
      ? `${withUnit(b, m.unit)} → ${withUnit(a, m.unit)}`
      : `${b} → ${withUnit(a, m.unit)}`;
  };
  const pair = (item.metrics || []).find((m) => m.before != null && m.after != null);
  if (pair) return `${pair.label}: ${show(pair)}`;
  const after = (item.metrics || []).find((m) => m.after != null);
  return after
    ? `${after.label}: ${withUnit(after.afterText ?? after.after, after.unit)}`
    : null;
}

const caseRow = (c) => `
  <article class="job">
    <div class="job-head">
      <h3>${esc(c.name)}</h3>
      <span class="when">${esc(c.period || '')}</span>
    </div>
    <p class="sector">${esc(c.sector)}</p>
    ${c.capacity ? `<p class="capacity">${esc(c.capacity)}</p>` : ''}
    ${headlineMetric(c) ? `<p class="metric">${esc(headlineMetric(c))}</p>` : ''}
    ${(c.scope || []).length
    ? `<ul>${c.scope.slice(0, 3).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
  </article>`;

const skillsBlock = () => stackGroups('EN').map((g) => `
  <div class="skill">
    <h4>${esc(g.title)}</h4>
    <p>${esc(g.lines.flatMap((line) => line.items).join(', '))}</p>
  </div>`).join('');

const roleRow = (c) => `
  <article class="role">
    <div class="job-head">
      <h3>${esc(c.role)}</h3>
      <span class="when">${esc(c.period)}</span>
    </div>
    <p class="sector">${esc(c.company)}</p>
    <p class="desc">${esc(c.desc)}</p>
  </article>`;

function page() {
  const cases = webProjects('EN');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Aleksandr Gribakin — CV</title>
<style>
  @page { size: A4; margin: 13mm 12mm 15mm; }
  * { box-sizing: border-box; }
  body {
    font: 9.2pt/1.45 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 0; color: #14191b; background: #fff;
  }
  h1, h2, h3, h4 { margin: 0; }
  a { color: inherit; text-decoration: none; }

  header { border-bottom: 2px solid #b8430f; padding-bottom: 4mm; margin-bottom: 6mm; }
  header h1 { font-size: 21pt; letter-spacing: .04em; }
  header .role { font-size: 11.5pt; color: #55625c; margin: 2mm 0 0; }
  header .contact {
    font: 8.6pt/1.5 Consolas, "SF Mono", Menlo, monospace;
    color: #4a5751; margin-top: 3mm;
  }
  header .contact span + span::before { content: " · "; color: #a7b2ad; }

  section { margin-bottom: 6mm; break-inside: avoid; }
  section > h2 {
    font: 8.4pt/1 Consolas, "SF Mono", Menlo, monospace;
    letter-spacing: .16em; text-transform: uppercase; color: #b8430f;
    border-bottom: 1px solid #e2e7e5; padding-bottom: 2mm; margin-bottom: 4mm;
  }
  .lede { font-size: 9.8pt; color: #33403a; margin: 0; }

  .job, .role { margin-bottom: 4.5mm; break-inside: avoid; }
  .job-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
  .job-head h3 { font-size: 10.6pt; }
  .when { font: 8.4pt Consolas, monospace; color: #7b8781; white-space: nowrap; }
  .sector { margin: .8mm 0 0; color: #55625c; font-size: 8.8pt; }
  /* The capacity line is not decoration: four of these clients have their own
     engineering teams, and a CV that lets "worked with Sixt" stand unqualified
     is a CV that loses the room the moment someone asks what exactly was done. */
  .capacity {
    margin: 1mm 0 0; font: 8.4pt Consolas, monospace; color: #8a5a3c;
  }
  .metric {
    margin: 1.4mm 0 0; font: 8.8pt Consolas, monospace;
    color: #14191b; background: #fdf3ee; display: inline-block; padding: 1mm 2mm;
  }
  .job ul { margin: 1.6mm 0 0; padding-left: 4.5mm; color: #33403a; }
  .job li { margin-bottom: .6mm; }
  .desc { margin: 1.2mm 0 0; color: #33403a; }

  .skills { column-count: 2; column-gap: 7mm; }
  .skill { break-inside: avoid; margin-bottom: 3.4mm; }
  .skill h4 {
    font: 8.4pt Consolas, monospace; color: #14191b; letter-spacing: .02em;
  }
  .skill p { margin: .8mm 0 0; font-size: 8.2pt; color: #4a5751; }

  .note {
    font-size: 8pt; color: #7b8781; border-left: 2px solid #e2e7e5;
    padding-left: 3mm; margin-top: 2mm;
  }
</style></head><body>

<header>
  <h1>Aleksandr Gribakin</h1>
  <p class="role">${esc(L.ROLE)}</p>
  <p class="contact">
    <span>dev24.pro</span><span>${esc(CONTACTS.email)}</span><span>${esc(CONTACTS.telegram)}</span>
  </p>
</header>

<section>
  <h2>Summary</h2>
  <p class="lede">${esc(L.BIO)}</p>
</section>

<section>
  <h2>Selected client work</h2>
  ${cases.map(caseRow).join('')}
  <p class="note">Figures are the clients' own. Roles are stated as scoped:
  several of these companies have their own engineering teams, and the entry
  names the module or region delivered rather than the whole product.</p>
</section>

<section>
  <h2>Experience</h2>
  ${L.CAREER.map(roleRow).join('')}
</section>

<section>
  <h2>Technical skills — ${stackToolCount()} tools across ${stackGroups('EN').length} areas</h2>
  <div class="skills">${skillsBlock()}</div>
</section>

</body></html>`;
}

const html = page();
const browser = await chromium.launch();
const ctx = await browser.newContext();
const p = await ctx.newPage();
await p.setContent(html, { waitUntil: 'load' });
await p.emulateMedia({ media: 'print' });
await p.evaluate(() => document.fonts?.ready);
await p.pdf({
  path: join(HERE, 'dev24-resume-en.pdf'),
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-size:7pt;color:#8b968f;font-family:Consolas,monospace;'
    + 'padding:0 12mm;display:flex;justify-content:space-between;">'
    + '<span>Aleksandr Gribakin — dev24.pro</span><span class="pageNumber"></span></div>',
  margin: { top: '13mm', right: '12mm', bottom: '15mm', left: '12mm' },
});
await writeFile(join(HERE, 'resume-en.html'), html, 'utf8');
await ctx.close();
await browser.close();

const size = (await readFile(join(HERE, 'dev24-resume-en.pdf'))).length;
console.log(`dev24-resume-en.pdf — ${Math.round(size / 1024)} KB`);

// The employment history is the one part of this document not drawn from
// something the site can prove. Say so on every build rather than letting a
// placeholder reach a recruiter.
const placeholders = L.CAREER.filter((c) => !/\b(LLC|Ltd|Inc|GmbH|OOO|ООО)\b/i.test(c.company)
  && c.company === c.company.replace(/[A-Z]{2,}/, c.company));
if (placeholders.length) {
  console.log(`\n  WARNING: ${placeholders.length} of ${L.CAREER.length} Experience entries name`);
  console.log('  a kind of work, not an employer — "Cloud-native platform", "Digital agency".');
  console.log('  Real company names and verified dates belong in LOCALE.CAREER before this');
  console.log('  file is sent to anyone.');
}
