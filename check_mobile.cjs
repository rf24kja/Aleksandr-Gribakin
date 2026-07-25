const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const passed = [];
  const failed = [];
  const check = (name, cond) => {
    (cond ? passed : failed).push(name);
    console.log(`${cond ? '  ✅' : '  ❌'} ${name}`);
  };

  const APP = 'http://localhost:5173';

  // ============ TEST TERMINAL ON MOBILE (375x667) ============
  console.log('\n=== TERMINAL MODE @ 375x667 (iPhone SE) ===');
  const tPage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await tPage.goto(APP, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await tPage.waitForTimeout(2000);
  // Switch to terminal
  await tPage.click('.settings-gear', { force: true });
  await tPage.waitForTimeout(500);
  await tPage.click('[data-smode="terminal"]', { force: true });
  await tPage.waitForTimeout(2000);

  // Terminal mode is active
  const tMode = await tPage.evaluate(() => document.documentElement.getAttribute('data-mode'));
  check('Terminal mode active', tMode === 'terminal');

  // No horizontal overflow
  const tOverflow = await tPage.evaluate(() => {
    return document.documentElement.scrollWidth <= window.innerWidth + 1;
  });
  check('No horizontal overflow', tOverflow);

  // Terminal intro visible
  check('Terminal intro visible', await tPage.isVisible('#terminalIntro'));
  check('ASCII logo visible', await tPage.isVisible('.ti-logo'));
  check('Prompt visible', await tPage.isVisible('.ti-prompt'));

  // Boot info visible
  const tiOkCount = await tPage.$$eval('.ti-ok', els => els.length);
  check(`ti-ok elements: ${tiOkCount}`, tiOkCount >= 3);

  // Sections visible
  const sections = await tPage.$$eval('.section-overlay', els => els.filter(el => el.offsetParent !== null).length);
  check(`Visible sections: ${sections}`, sections >= 3);

  // Stats grid visible
  check('Stats grid visible', await tPage.isVisible('#statsOverlay'));
  check('Career list visible', await tPage.isVisible('#careerOverlay'));
  check('Projects visible', await tPage.isVisible('#projectsOverlay'));
  check('Achievements visible', await tPage.isVisible('#achievementsOverlay'));
  check('Form visible', await tPage.isVisible('#ctaSection'));

  // FPS counter hidden
  const fpsHidden = await tPage.evaluate(() => {
    const el = document.getElementById('fpsCounter');
    return !el || window.getComputedStyle(el).display === 'none';
  });
  check('FPS hidden', fpsHidden);

  // Scroll progress hidden
  const spHidden = await tPage.evaluate(() => {
    const el = document.getElementById('scrollProgress');
    return !el || window.getComputedStyle(el).display === 'none';
  });
  check('Scroll progress hidden', spHidden);

  // Gear opens settings
  await tPage.click('#ui-overlay .settings-gear', { force: true });
  await tPage.waitForTimeout(500);
  const popupMobile = await tPage.evaluate(() => {
    const popup = document.getElementById('settingsPopup');
    return popup && (popup.style.display === 'flex' || window.getComputedStyle(popup).display === 'flex');
  });
  check('Terminal settings opens on mobile', popupMobile);

  // Settings card fits within viewport
  const cardFits = await tPage.evaluate(() => {
    const card = document.querySelector('.settings-card');
    if (!card) return false;
    const rect = card.getBoundingClientRect();
    return rect.width <= window.innerWidth && rect.height <= window.innerHeight;
  });
  check('Settings card fits mobile viewport', cardFits);

  // Close settings
  await tPage.click('#settingsClose', { force: true });
  await tPage.waitForTimeout(300);

  // Project cards not overflowing
  const projOK = await tPage.evaluate(() => {
    const cards = document.querySelectorAll('.project-card');
    return [...cards].every(c => c.getBoundingClientRect().right <= window.innerWidth + 2);
  });
  check('Project cards not overflowing', projOK);

  // Scroll to career
  await tPage.evaluate(() => document.getElementById('careerOverlay').scrollIntoView());
  await tPage.waitForTimeout(500);
  const careerItems = await tPage.$$eval('.career-item', els => els.filter(el => el.offsetParent !== null).length);
  check(`Career items visible: ${careerItems}`, careerItems >= 5);

  // Scroll to form
  await tPage.evaluate(() => document.getElementById('ctaSection').scrollIntoView());
  await tPage.waitForTimeout(500);
  check('Form section visible', await tPage.isVisible('.terminal-form'));
  check('Submit button visible', await tPage.isVisible('.terminal-form button'));

  await tPage.close();

  // ============ TEST DESKTOP ON MOBILE ============
  console.log('\n=== DESKTOP MODE @ 375x667 (iPhone SE) ===');
  const dPage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await dPage.goto(APP, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await dPage.waitForTimeout(2000);
  // Switch to desktop
  await dPage.click('.settings-gear', { force: true });
  await dPage.waitForTimeout(500);
  await dPage.click('[data-smode="desktop"]', { force: true });
  await dPage.waitForTimeout(2000);

  // Desktop mode is active
  const dMode = await dPage.evaluate(() => document.documentElement.getAttribute('data-mode'));
  check('Desktop mode active', dMode === 'desktop');

  // Desktop shell visible
  check('Desktop shell visible', await dPage.isVisible('#desktop-shell'));

  // No horizontal overflow in desktop
  const dOverflow = await dPage.evaluate(() => {
    return document.documentElement.scrollWidth <= window.innerWidth + 1;
  });
  check('No horizontal overflow', dOverflow);

  // Taskbar visible
  check('Taskbar visible', await dPage.isVisible('#taskbar'));
  check('Start button visible', await dPage.isVisible('#start-btn'));
  check('System tray visible', await dPage.isVisible('#system-tray'));
  check('Clock visible', await dPage.isVisible('#tray-clock'));

  // Desktop icons container exists
  check('Desktop icons container', await dPage.isVisible('#desktop-icons') || await dPage.isVisible('#desktop-windows'));

  // Gear opens settings in desktop
  await dPage.click('#system-tray .settings-gear', { force: true });
  await dPage.waitForTimeout(500);
  const deskPopup = await dPage.evaluate(() => {
    const popup = document.getElementById('settingsPopup');
    return popup && (popup.style.display === 'flex' || window.getComputedStyle(popup).display === 'flex');
  });
  check('Desktop settings opens on mobile', deskPopup);

  // Settings card fits
  const deskCardFits = await dPage.evaluate(() => {
    const card = document.querySelector('.settings-card');
    if (!card) return false;
    const rect = card.getBoundingClientRect();
    return rect.width <= window.innerWidth && rect.height <= window.innerHeight;
  });
  check('Desktop settings card fits mobile', deskCardFits);

  await dPage.close();

  // ============ SUMMARY ============
  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed.length} passed, ${failed.length} failed out of ${passed.length + failed.length} checks`);
  if (failed.length > 0) {
    console.log('\nFAILED:');
    failed.forEach(f => console.log(`  - ${f}`));
  }

  await browser.close();
  process.exit(failed.length > 0 ? 1 : 0);
})();
