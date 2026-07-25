const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;
  const results = [];

  function check(name, cond) {
    if (cond) { passed++; results.push(`  ✅ ${name}`); }
    else { failed++; results.push(`  ❌ ${name}`); }
  }

  const APP = 'http://localhost:5173';

  try {
    // 1. Load page in terminal mode
    await page.goto(APP, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Switch to terminal mode via settings — use force:true due to GSAP animations
    await page.click('.settings-gear', { force: true });
    await page.waitForTimeout(500);
    await page.click('[data-smode="terminal"]', { force: true });
    await page.waitForTimeout(1500);

    // Wait for terminal elements
    await page.waitForSelector('#terminalIntro', { state: 'visible', timeout: 8000 }).catch(() => {});

    // --- TERMINAL MODE CHECKS ---
    console.log('\n=== TERMINAL MODE DEEP AUDIT ===');

    // 1. Terminal intro shows
    check('Terminal intro visible', await page.isVisible('#terminalIntro'));
    
    // 2. ASCII art logo visible
    check('ASCII logo present', await page.isVisible('.ti-logo'));
    
    // 3. Boot sequence info lines present
    const tiInfo = await page.$$('.ti-info');
    check('Boot info lines present', tiInfo.length >= 3);
    
    // 4. Terminal prompt visible ($ sign)
    const bodyText = await page.textContent('body');
    check('Terminal prompt visible', bodyText.includes('visitor@portfolio:~$'));
    
    // 5. Main content is visible
    check('Main content visible', await page.isVisible('#mainContent'));
    
    // 6. Business-specific intro is hidden
    check('Business intro hidden', await page.evaluate(() => {
      const el = document.getElementById('introText');
      return !el || el.style.display === 'none' || window.getComputedStyle(el).display === 'none';
    }));
    
    // 7. Canvas/3D is hidden
    check('3D canvas hidden', await page.evaluate(() => {
      const c = document.querySelector('canvas#webgl');
      return !c || window.getComputedStyle(c).display === 'none';
    }));
    
    // 8. Portrait is hidden
    check('Portrait hidden', await page.evaluate(() => {
      const p = document.getElementById('portrait-wrap');
      return !p || window.getComputedStyle(p).display === 'none';
    }));
    
    // 9. Font is monospace
    check('Font is monospace', await page.evaluate(() => {
      const font = window.getComputedStyle(document.body).fontFamily.toLowerCase();
      return font.includes('mono') || font.includes('monospace');
    }));
    
    // 10. Scanlines present (CRT effect)
    check('Scanlines present', await page.isVisible('#scanlines'));
    
    // 11. Scene label hidden
    check('Scene label hidden', await page.evaluate(() => {
      const el = document.getElementById('scene-label');
      return !el || window.getComputedStyle(el).display === 'none';
    }));
    
    // 12. Scroll progress hidden
    check('Scroll progress hidden', await page.evaluate(() => {
      const el = document.querySelector('.scroll-progress');
      return !el || window.getComputedStyle(el).display === 'none';
    }));
    
    // 13. FPS hidden
    check('FPS counter hidden', await page.evaluate(() => {
      const el = document.getElementById('fpsCounter');
      return !el || window.getComputedStyle(el).display === 'none';
    }));
    
    // 14. Gear in ui-overlay visible
    check('Terminal gear visible', await page.evaluate(() => {
      const gear = document.querySelector('#ui-overlay .settings-gear');
      return gear && window.getComputedStyle(gear).display !== 'none';
    }));
    
    // 15. Sections are visible
    const sections = await page.$$('.section-overlay');
    check('Sections present', sections.length >= 3);
    
    // 16. Career items with terminal decorations
    const careerItems = await page.$$('.career-item');
    check('Career items present', careerItems.length >= 5);
    
    // 17. Period has brackets decoration
    check('Period has brackets', await page.evaluate(() => {
      const p = document.querySelector('.career-item .period');
      if (!p) return false;
      const before = window.getComputedStyle(p, '::before').content;
      return before.includes('[') || before.includes('>');
    }));
    
    // 18. Category tabs visible
    check('Category tabs visible', await page.isVisible('.cat-tabs'));
    
    // 19. Projects present
    const projects = await page.$$('.project-card');
    check('Project cards present', projects.length >= 5);
    
    // 20. Achievements present
    const achievements = await page.$$('.achievement-item');
    check('Achievement items present', achievements.length >= 3);
    
    // 21. Terminal form visible
    check('Terminal form visible', await page.isVisible('.terminal-form'));
    
    // 22. Form input styling
    check('Form has monospace font', await page.evaluate(() => {
      const input = document.querySelector('.terminal-form input');
      if (!input) return false;
      const font = window.getComputedStyle(input).fontFamily.toLowerCase();
      return font.includes('mono') || font.includes('monospace');
    }));
    
    // 23. Submit button present
    check('Submit button present', await page.isVisible('.terminal-form button[type="submit"]'));
    
    // 24. Gear opens settings in terminal mode
    const gearTerm = await page.$('#ui-overlay .settings-gear');
    if (gearTerm) {
      await gearTerm.click({ force: true });
      await page.waitForTimeout(500);
      check('Terminal settings opens', await page.evaluate(() => {
        const popup = document.getElementById('settingsPopup');
        return popup && popup.style.display === 'flex';
      }));
      // Close
      await page.click('#settingsClose', { force: true });
      await page.waitForTimeout(200);
    }

    // --- VISUAL LAYOUT AUDIT ---
    console.log('\n=== LAYOUT AUDIT ===');
    
    // 25. No horizontal overflow
    check('No horizontal overflow', await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    }));
    
    // 26. Sections have correct terminal color scheme
    check('Green accent color present', await page.evaluate(() => {
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--t-accent').trim();
      return accent === '#00ff41';
    }));
    
    // 27. Background is dark
    check('Background is dark', await page.evaluate(() => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const rgb = bg.match(/\d+/g);
      return rgb && parseInt(rgb[0]) < 30;
    }));

  } catch (e) {
    console.error('Error during audit:', e.message);
    failed++;
  }

  // Summary
  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed+failed} checks`);
  
  // Print all results
  results.forEach(r => console.log(r));

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
