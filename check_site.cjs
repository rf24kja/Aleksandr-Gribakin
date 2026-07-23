async function main() {
  const { chromium } = require('playwright');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') 
      errors.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => errors.push({ type: 'exception', text: err.message }));
  
  console.log('Loading page...');
  await page.goto('https://gribakin-portfolio.onrender.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  
  console.log('\n=== CONSOLE ERRORS (initial load) ===');
  if (errors.length === 0) console.log('(none)');
  else errors.forEach(e => console.log(`  [${e.type}] ${e.text}`));
  
  const mode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`\ndata-mode: "${mode}"`);
  console.log(`data-theme: "${theme}"`);
  
  // Scroll through full page
  console.log('\n=== SCROLLING... ===');
  const prevCount = errors.length;
  const { scrollHeight } = await page.evaluate(() => ({ scrollHeight: document.body.scrollHeight }));
  for (let i = 0; i <= 100; i += 5) {
    await page.evaluate(({ pct, sh }) => window.scrollTo(0, sh * pct / 100), { pct: i, sh: scrollHeight });
    await page.waitForTimeout(80);
  }
  
  const scrollErrors = errors.slice(prevCount);
  console.log(`Errors during scroll: ${scrollErrors.length}`);
  scrollErrors.forEach(e => console.log(`  [${e.type}] ${e.text}`));
  
  // Career section
  const careerInfo = await page.evaluate(() => {
    const cards = document.querySelectorAll('.career-item');
    return Array.from(cards).map((el, i) => ({
      idx: i,
      period: el.querySelector('.period')?.textContent?.trim() || '',
      role: el.querySelector('.role-company')?.textContent?.trim()?.slice(0, 60) || '',
      descLen: el.querySelector('.desc')?.textContent?.length || 0
    }));
  });
  careerInfo.forEach(c => console.log(`  [${c.idx}] ${c.period} — ${c.role}`));
  
  // Click first career card
  if (careerInfo.length > 0) {
    // Scroll back to career section
    const careerY = await page.evaluate(() => {
      const el = document.querySelector('.career-item');
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
    await page.evaluate(({ y }) => window.scrollTo(0, Math.max(0, y - 100)), { y: careerY });
    await page.waitForTimeout(500);
    
    console.log('\nClicking career item 0...');
    const cards = await page.$$('.career-item');
    if (cards.length > 0) await cards[0].click();
    await page.waitForTimeout(2000);
    
    const careerDetail = await page.evaluate(() => {
      const panel = document.getElementById('projectDetail');
      if (!panel || !panel.classList.contains('active')) return { active: false, error: 'not active' };
      const achItems = panel.querySelectorAll('.pd-ach-item');
      const achList = Array.from(achItems).map(el => el.textContent?.trim()?.slice(0, 120));
      return {
        active: true,
        hero: panel.querySelector('.pd-title')?.textContent?.trim()?.slice(0, 80) || '',
        blockCount: panel.querySelectorAll('.pd-para').length,
        chartCount: panel.querySelectorAll('.pd-chart-item').length,
        techTags: panel.querySelectorAll('.pd-stack-tag').length,
        achCount: achItems.length,
        achievements: achList
      };
    });
    console.log('Career detail panel:', JSON.stringify(careerDetail, null, 2));
    
    // Close
    await page.evaluate(() => {
      const close = document.querySelector('[data-pd-close]');
      if (close) close.click();
    });
    await page.waitForTimeout(500);
  }
  
  // Projects section
  const projCards = await page.evaluate(() => {
    const cards = document.querySelectorAll('.project-card');
    return Array.from(cards).map((el, i) => ({
      idx: i,
      name: el.querySelector('h3')?.textContent?.trim() || '',
      cat: el.dataset.cat,
      tag: el.querySelector('.card-tag')?.textContent?.trim() || '',
      desc: el.querySelector('.desc')?.textContent?.trim()?.slice(0, 60) || ''
    }));
  });
  console.log(`\n=== PROJECT CARDS: ${projCards.length} ===`);
  
  // Check for duplicate names
  const names = projCards.map(c => c.name);
  const uniqueNames = [...new Set(names)];
  console.log(`Unique names: ${uniqueNames.length}/${names.length}`);
  if (uniqueNames.length !== names.length) {
    console.log('DUPLICATE NAMES:');
    const seen = {};
    names.forEach((n, i) => {
      if (seen[n] !== undefined) console.log(`  "${n}" at idx ${seen[n]} and ${i}`);
      seen[n] = i;
    });
  }
  
  // Check for duplicate descriptions
  const descs = projCards.map(c => c.desc);
  const uniqueDescs = [...new Set(descs)];
  console.log(`Unique descs: ${uniqueDescs.length}/${descs.length}`);
  
  projCards.slice(0, 5).forEach(c => console.log(`  [${c.idx}] ${c.name} (${c.cat}): ${c.desc}`));
  
  // Open first project detail
  if (projCards.length > 0) {
    const projY = await page.evaluate(() => {
      const el = document.querySelector('.project-card');
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
    await page.evaluate(({ y }) => window.scrollTo(0, Math.max(0, y - 100)), { y: projY });
    await page.waitForTimeout(500);
    
    console.log(`\nClicking project "${projCards[0].name}"...`);
    const projCardsEls = await page.$$('.project-card');
    if (projCardsEls.length > 0) await projCardsEls[0].click();
    await page.waitForTimeout(2000);
    
    const projDetail = await page.evaluate(() => {
      const panel = document.getElementById('projectDetail');
      if (!panel || !panel.classList.contains('active')) return { active: false, error: 'panel not active' };
      return {
        active: true,
        hero: panel.querySelector('.pd-title')?.textContent?.trim()?.slice(0, 80) || '',
        detailCount: panel.querySelectorAll('.pd-para').length,
        chartCount: panel.querySelectorAll('.pd-chart-item').length,
        featureCount: panel.querySelectorAll('.pd-feature-item').length,
        hasScreenshot: !!panel.querySelector('.pd-svg')
      };
    });
    console.log('Project detail panel:', JSON.stringify(projDetail, null, 2));
    
    // Close
    await page.evaluate(() => {
      const close = document.querySelector('[data-pd-close]');
      if (close) close.click();
    });
    await page.waitForTimeout(500);
  }
  
  // Take fullpage screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_full.png', fullPage: true });
  console.log('\nScreenshot saved: screenshot_full.png');
  
  await browser.close();
  console.log('\n=== DONE ===');
}

main().catch(err => { console.error(err); process.exit(1); });
