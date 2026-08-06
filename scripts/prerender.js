/**
 * Writes the site's content into the built HTML.
 *
 * Everything on this site is rendered by JavaScript from ponytail.config.js and
 * data/projects.js, so before that script runs the document carries 164 words —
 * and no crawler that skips JS ever sees the other three thousand. Googlebot
 * renders, eventually and without guarantees; Yandex is weaker at it, and the
 * link-preview and AI crawlers do not render at all. For a site whose audience
 * is half Russian-speaking that is the difference between being indexed and not.
 *
 * This runs after `vite build` and emits real HTML for every page:
 *
 *   /            EN, canonical https://dev24.pro/
 *   /en/         EN
 *   /ru/         RU
 *   /project/:id both locales' pages are separate URLs under each language
 *
 * No headless browser: the data are plain ES modules, so the markup is built
 * from the same source the runtime uses. The client still renders on boot and
 * replaces this content — the two agree because they read the same objects.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import PONYTAIL from '../src/config/ponytail.config.js';
import { PROJECTS_DETAIL, CAREER_DETAIL, ACHIEVEMENT_DETAIL } from '../src/data/projects.js';
import { computeStats } from '../src/lib/stats.js';
import { webProjects } from '../src/data/webProjects.js';
import { PRIVACY } from '../src/data/privacy.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://dev24.pro';

const esc = (s) => String(s ?? '')
  .replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/**
 * URL slug for a career entry: its period, which is unique and readable.
 *
 * Index-based paths would work for the router but say nothing to a reader or a
 * search result, and they would change meaning the day an entry is inserted.
 */
const careerSlug = (entry) => entry.period.replace(/[–—]/g, '-').replace(/\s+/g, '');

/** Achievement years are unique across the list, so the year is the slug. */
const achievementSlug = (entry) => String(entry.year);

/** Resolves a dotted i18n key against a locale object. */
const lookup = (locale, key) => key.split('.').reduce((o, k) => o?.[k], locale);

// ---------------------------------------------------------------------------
// Content blocks, mirroring what the orchestrator renders at runtime.
//
// `visible` is set on every card. The entrance animation starts these at
// opacity 0 and the class is what reveals them; without it the prerendered
// content is technically present but painted invisible, which is both useless
// to a reader with JS disabled and the kind of thing a crawler discounts.
// ---------------------------------------------------------------------------

function careerHTML(l) {
  return l.CAREER.map((c, i) => `<button type="button" class="career-item visible" data-career="${i}">
        <span class="period">${esc(c.period)}</span>
        <span class="info">
          <span class="role-company">${esc(c.role)} <span class="company">@ ${esc(c.company)}</span></span>
          <span class="desc">${esc(c.desc)}</span>
        </span>
      </button>`).join('\n      ');
}

// Links, not buttons. The runtime replaces this grid with buttons on boot, so
// interactive behaviour is unchanged — but in the served HTML a crawler can
// follow these through to the seventeen project pages, and a reader without
// JavaScript gets a working site rather than a dead grid.
function projectsHTML(l, prefix) {
  return l.PROJECTS.map((p) => `<a class="project-card visible" href="/${prefix}project/${esc(p.id)}" data-project-id="${esc(p.id)}" data-cat="${esc(p.cat)}">
        <span class="card-inner">
          <span class="card-tag">${esc(p.tag)}</span>
          <span class="card-title">${esc(p.name)}</span>
          <span class="stack">${esc(p.stack)}</span>
          <span class="metric">\u25b3 ${esc(p.metric)}</span>
          <span class="desc">${esc(p.desc)}</span>
        </span>
      </a>`).join('\n      ');
}

function achievementsHTML(l) {
  return l.ACHIEVEMENTS.map((a, i) => `<button type="button" class="achievement-item visible" data-ach="${i}">
        <span class="ach-year">${esc(a.year)}</span>
        <span class="ach-title">${esc(a.title)}</span>
        <span class="ach-desc">${esc(a.desc)}</span>
      </button>`).join('\n      ');
}

function statsHTML(lang) {
  const stats = computeStats(lang);
  return stats.map((s, i) => `<button type="button" class="stat-item visible" data-stat="${i}">
        <span class="stat-value">${esc(s.display ?? s.value)}</span>
        <span class="stat-label">${esc(s.label)}</span>
        ${s.hint ? `<span class="stat-hint">${esc(s.hint)}</span>` : ''}
      </button>`).join('\n      ');
}

// ---------------------------------------------------------------------------
// Document assembly
// ---------------------------------------------------------------------------

function fillContainer(html, id, content) {
  // The containers are emitted by the build as a single empty element, so an
  // exact-match replace is safer here than a parser: if the markup ever changes
  // shape the assertion below fails the build rather than silently shipping an
  // empty page.
  const re = new RegExp(`(<div[^>]*id="${id}"[^>]*>)\\s*(</div>)`);
  if (!re.test(html)) throw new Error(`prerender: container #${id} not found or not empty`);
  return html.replace(re, `$1\n      ${content}\n    $2`);
}

function applyLocaleText(html, locale) {
  // Every data-i18n element holds a single text node — checked; none of them
  // wrap other elements — so replacing the text between the tags is safe.
  return html.replace(
    /(<(\w+)([^>]*\bdata-i18n="([^"]+)"[^>]*)>)([^<]*)(<\/\2>)/g,
    (whole, open, tag, attrs, key, _text, close) => {
      const value = lookup(locale, key);
      if (typeof value !== 'string') return whole;
      // Placeholders live in an attribute, not in the element's text.
      if (/\bplaceholder=/.test(attrs)) {
        return `${open.replace(/placeholder="[^"]*"/, `placeholder="${esc(value)}"`)}${_text}${close}`;
      }
      return `${open}${esc(value)}${close}`;
    },
  );
}

function setHead(html, { lang, canonical, title, description }) {
  let out = html
    .replace(/<html([^>]*)\slang="[^"]*"/, `<html$1 lang="${lang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`);

  // hreflang has to name URLs that exist and that point back — a canonical
  // contradicting the alternates invalidates the whole cluster, which is what
  // the previous /en and /ru pages did by self-canonicalising to the apex.
  out = out.replace(
    /<link rel="alternate"[^>]*>\s*/g, '',
  ).replace(
    '<link rel="canonical"',
    `<link rel="alternate" hreflang="en" href="${ORIGIN}/en" />\n  `
    + `<link rel="alternate" hreflang="ru" href="${ORIGIN}/ru" />\n  `
    + `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />\n  `
    + '<link rel="canonical"',
  );
  return out;
}

function localePage(shell, lang, canonical, prefix = '') {
  const l = PONYTAIL.LOCALE[lang];
  const seo = PONYTAIL.SEO?.[lang] || {};
  let html = applyLocaleText(shell, l);
  html = fillContainer(html, 'statsGrid', statsHTML(lang));
  html = fillContainer(html, 'careerList', careerHTML(l));
  html = fillContainer(html, 'projectsGrid', projectsHTML(l, prefix));
  html = fillContainer(html, 'achievementsGrid', achievementsHTML(l));
  return setHead(html, {
    lang: lang.toLowerCase(),
    canonical,
    title: seo.title || `${l.NAME || 'Aleksandr Gribakin'} — ${l.ROLE}`,
    description: seo.description || l.BIO,
  });
}

/**
 * A project page.
 *
 * Same document, plus the project's own prose in a block the runtime does not
 * touch — the detail panel is a separate overlay, so this cannot fight it — and
 * a canonical of its own so the seventeen projects stop competing as one URL.
 */
function projectPage(shell, lang, project, detail, canonical, prefix) {
  const l = PONYTAIL.LOCALE[lang];
  const body = `
      <article class="prerender-detail" data-prerendered="project">
        <h2>${esc(project.name)}</h2>
        <p class="prerender-meta">${esc(project.tag)} / ${esc(project.cat)} — ${esc(project.stack)}</p>
        <p>${esc(l.DETAIL?.REFERENCE_NOTE || '')}</p>
        ${(detail.details || []).map((d) => `<p>${esc(d)}</p>`).join('\n        ')}
        <h3>${esc(l.DETAIL?.KEY_METRICS || 'Key Metrics')}</h3>
        <ul>${(detail.highlights || []).map((h) => `<li>${esc(h.label)}: ${esc(h.value)}${esc(h.unit || '')}</li>`).join('')}</ul>
        <h3>${esc(l.DETAIL?.FEATURES || 'Features')}</h3>
        <ul>${(detail.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      </article>`;

  let html = localePage(shell, lang, canonical, prefix);
  html = html.replace('<div id="projectDetail"></div>', `<div id="projectDetail"></div>\n  ${body}`);
  return setHead(html, {
    lang: lang.toLowerCase(),
    canonical,
    title: `${project.name} — ${l.ROLE}`,
    description: project.desc,
  });
}

/**
 * A career entry's page.
 *
 * Five entries shared the homepage URL, the same problem the projects had: a
 * hash route is not a document, so none of them could be indexed or linked to
 * on its own.
 */
function careerPage(shell, lang, entry, detail, canonical, prefix) {
  const l = PONYTAIL.LOCALE[lang];
  const body = `
      <article class="prerender-detail" data-prerendered="career">
        <h2>${esc(entry.role)} — ${esc(entry.company)}</h2>
        <p class="prerender-meta">${esc(entry.period)}</p>
        <p>${esc(entry.desc)}</p>
        ${(detail?.details || []).map((d) => `<p>${esc(d)}</p>`).join('\n        ')}
        ${detail?.keyAchievements?.length ? `<h3>${esc(l.DETAIL?.KEY_ACH || 'Key Achievements')}</h3>
        <ul>${detail.keyAchievements.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
        ${detail?.techStack?.length ? `<h3>${esc(l.DETAIL?.TECH_STACK || 'Tech Stack')}</h3>
        <p>${esc(detail.techStack.join(' · '))}</p>` : ''}
        ${detail?.highlights?.length ? `<h3>${esc(l.DETAIL?.KEY_METRICS || 'Key Metrics')}</h3>
        <ul>${detail.highlights.map((h) => `<li>${esc(h.label)}: ${esc(h.value)}${esc(h.unit || '')}</li>`).join('')}</ul>` : ''}
      </article>`;

  let html = localePage(shell, lang, canonical, prefix);
  html = html.replace('<div id="projectDetail"></div>', `<div id="projectDetail"></div>\n  ${body}`);
  return setHead(html, {
    lang: lang.toLowerCase(),
    canonical,
    title: `${entry.role} @ ${entry.company} (${entry.period}) — ${l.ROLE}`,
    description: entry.desc,
  });
}

/**
 * A client case's page.
 *
 * Only published cases reach this function — a draft has no URL, no sitemap
 * entry and no document, which is the difference between "not written yet" and
 * "written from guesswork".
 */
function casePage(shell, lang, item, canonical, prefix) {
  const l = PONYTAIL.LOCALE[lang];
  const L = l.WEB_LABELS || {};
  const beat = (label, body) => (body ? `<h3>${esc(label)}</h3>\n        <p>${esc(body)}</p>` : '');
  const body = `
      <article class="prerender-detail" data-prerendered="case">
        <h2>${esc(item.name)}</h2>
        <p class="prerender-meta">${esc([item.sector, item.period, item.capacity].filter(Boolean).join(' · '))}</p>
        ${beat(L.SITUATION, item.situation)}
        ${beat(L.WORK, item.work)}
        ${beat(L.OUTCOME, item.outcome)}
        ${beat(L.EVIDENCE, item.evidence)}
        ${item.stack?.length ? `<h3>${esc(L.STACK || 'Stack')}</h3>
        <p>${esc(item.stack.join(' · '))}</p>` : ''}
      </article>`;

  let html = localePage(shell, lang, canonical, prefix);
  html = html.replace('<div id="projectDetail"></div>', `<div id="projectDetail"></div>\n  ${body}`);
  return setHead(html, {
    lang: lang.toLowerCase(),
    canonical,
    title: `${item.name} — ${l.ROLE}`,
    description: item.outcome || item.situation || item.sector,
  });
}

/**
 * The privacy policy as a real document.
 *
 * Prerendered like everything else, and for the same reason: a policy that only
 * exists once JavaScript has run is not a policy a regulator, a crawler or a
 * visitor with scripts blocked can read.
 */
function privacyPage(shell, lang, canonical, prefix) {
  const doc = PRIVACY[lang] || PRIVACY.EN;
  const body = `
      <article class="prerender-detail" data-prerendered="privacy">
        <h2>${esc(doc.title)}</h2>
        <p class="prerender-meta">${esc(doc.updated)}</p>
        <p>${esc(doc.intro)}</p>
        ${doc.sections.map((s) => `<h3>${esc(s.h)}</h3>
        ${(s.p || []).map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        ${(s.list || []).length ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
        ${(s.after || []).map((p) => `<p>${esc(p)}</p>`).join('\n        ')}`).join('\n        ')}
      </article>`;

  let html = localePage(shell, lang, canonical, prefix);
  html = html.replace('<div id="projectDetail"></div>', `<div id="projectDetail"></div>\n  ${body}`);
  return setHead(html, {
    lang: lang.toLowerCase(),
    canonical,
    title: `${doc.title} — dev24.pro`,
    description: doc.intro,
  });
}

/** A milestone's page. */
function achievementPage(shell, lang, entry, detail, canonical, prefix) {
  const l = PONYTAIL.LOCALE[lang];
  const body = `
      <article class="prerender-detail" data-prerendered="achievement">
        <h2>${esc(entry.title)}</h2>
        <p class="prerender-meta">${esc(entry.year)}</p>
        <p>${esc(entry.desc)}</p>
        ${(detail?.details || []).map((d) => `<p>${esc(d)}</p>`).join('\n        ')}
      </article>`;

  let html = localePage(shell, lang, canonical, prefix);
  html = html.replace('<div id="projectDetail"></div>', `<div id="projectDetail"></div>\n  ${body}`);
  return setHead(html, {
    lang: lang.toLowerCase(),
    canonical,
    title: `${entry.title} (${entry.year}) — ${l.ROLE}`,
    description: entry.desc,
  });
}

function sitemap(urls) {
  const body = urls.map(({ loc, priority }) => `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}/en" />
    <xhtml:link rel="alternate" hreflang="ru" href="${ORIGIN}/ru" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

async function emit(relPath, html) {
  const full = join(DIST, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html, 'utf8');
}

async function main() {
  const shell = await readFile(join(DIST, 'index.html'), 'utf8');
  const urls = [];
  const pending = [];

  const roots = [
    { lang: 'EN', path: 'index.html', loc: `${ORIGIN}/`, priority: '1.0' },
    { lang: 'EN', path: 'en/index.html', loc: `${ORIGIN}/en`, priority: '0.9' },
    { lang: 'RU', path: 'ru/index.html', loc: `${ORIGIN}/ru`, priority: '1.0' },
  ];

  for (const { lang, path, loc, priority } of roots) {
    await emit(path, localePage(shell, lang, loc, lang === 'RU' ? 'ru/' : ''));
    urls.push({ loc, priority });
  }

  let projectPages = 0;
  for (const [lang, prefix] of [['EN', ''], ['RU', 'ru/']]) {
    const l = PONYTAIL.LOCALE[lang];
    const details = PROJECTS_DETAIL[lang] || {};
    for (const project of l.PROJECTS) {
      const detail = details[project.id];
      if (!detail) continue;
      const loc = `${ORIGIN}/${prefix}project/${project.id}`;
      await emit(`${prefix}project/${project.id}/index.html`,
        projectPage(shell, lang, project, detail, loc, prefix));
      urls.push({ loc, priority: '0.7' });
      projectPages += 1;
    }
  }

  let casePages = 0;
  for (const [lang, prefix] of [['EN', ''], ['RU', 'ru/']]) {
    for (const item of webProjects(lang)) {
      const loc = `${ORIGIN}/${prefix}case/${item.id}`;
      pending.push([`${prefix}case/${item.id}/index.html`,
        casePage(shell, lang, item, loc, prefix)]);
      // Above the reference architectures: work someone paid for outranks a
      // description of how such work is done.
      urls.push({ loc, priority: '0.8' });
      casePages += 1;
    }
  }

  let privacyPages = 0;
  for (const [lang, prefix] of [['EN', ''], ['RU', 'ru/']]) {
    const loc = `${ORIGIN}/${prefix}privacy`;
    pending.push([`${prefix}privacy/index.html`, privacyPage(shell, lang, loc, prefix)]);
    urls.push({ loc, priority: '0.3' });
    privacyPages += 1;
  }

  let careerPages = 0;
  let achievementPages = 0;
  for (const [lang, prefix] of [['EN', ''], ['RU', 'ru/']]) {
    const l = PONYTAIL.LOCALE[lang];
    const careerDetails = CAREER_DETAIL[lang] || CAREER_DETAIL.EN || [];
    l.CAREER.forEach((entry, i) => {
      const slug = careerSlug(entry);
      const loc = `${ORIGIN}/${prefix}career/${slug}`;
      pending.push([`${prefix}career/${slug}/index.html`,
        careerPage(shell, lang, entry, careerDetails[i], loc, prefix)]);
      urls.push({ loc, priority: '0.6' });
      careerPages += 1;
    });

    const achDetails = ACHIEVEMENT_DETAIL[lang] || ACHIEVEMENT_DETAIL.EN || [];
    l.ACHIEVEMENTS.forEach((entry, i) => {
      const slug = achievementSlug(entry);
      const loc = `${ORIGIN}/${prefix}achievement/${slug}`;
      pending.push([`${prefix}achievement/${slug}/index.html`,
        achievementPage(shell, lang, entry, achDetails[i], loc, prefix)]);
      urls.push({ loc, priority: '0.5' });
      achievementPages += 1;
    });
  }

  for (const [path, html] of pending) await emit(path, html);

  await writeFile(join(DIST, 'sitemap.xml'), sitemap(urls), 'utf8');

  console.log(`prerender: ${roots.length} locale pages, ${projectPages} project, `
    + `${casePages} case, ${careerPages} career, ${achievementPages} milestone, `
    + `${privacyPages} privacy pages, `
    + `${urls.length} sitemap entries`);
}

main().catch((err) => {
  console.error('prerender failed:', err);
  process.exit(1);
});
