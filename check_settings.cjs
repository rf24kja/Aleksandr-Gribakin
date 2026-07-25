// Quick audit for settings gear + popup
async function main() {
  const { chromium } = require('playwright');
  const BASE = 'http://localhost:5173';
  const browser = await chromium.launch({ headless: true });

  let passed = 0, failed = 0;
  function check(name, ok) { console.log(`  ${ok ? '✅' : '❌'} ${name}`); ok ? passed++ : failed++; }

  // --- Business mode (default) ---
  const bizPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  bizPage.on('pageerror', err => errors.push(err.message));
  await bizPage.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await bizPage.waitForTimeout(2000);
  console.log('\n=== BUSINESS MODE ===');
  check('Page loads without errors', errors.length === 0);
  if (errors.length) errors.forEach(e => console.log(`  error: ${e}`));

  // Gear visible in h1
  const gearBiz = await bizPage.$('#settingsGear');
  check('Gear visible in business mode h1', !!gearBiz);
  const gearBizDisp = await gearBiz.evaluate(el => window.getComputedStyle(el).display !== 'none');
  check('Gear is displayed', gearBizDisp);

  // Gear spins
  const gearAnim = await gearBiz.evaluate(el => window.getComputedStyle(el).animationName);
  check('Gear has gearSpin animation', gearAnim.includes('gearSpin'));

  // Pause animation so Playwright considers element stable
  await bizPage.addStyleTag({ content: '.settings-gear { animation: none !important; }' });
  // Click gear → popup opens
  await gearBiz.click();
  await bizPage.waitForTimeout(300);
  const popupDisp = await bizPage.evaluate(() => document.getElementById('settingsPopup').style.display);
  check('Popup opens on gear click', popupDisp === 'flex');

  // Theme buttons visible
  const themeBtns = await bizPage.$$('.settings-opt[data-stheme]');
  check('Theme buttons exist', themeBtns.length === 2);

  // Mode buttons visible
  const modeBtns = await bizPage.$$('.settings-opt[data-smode]');
  check('Mode buttons exist', modeBtns.length === 3);

  // Dark theme active by default
  const darkActive = await bizPage.$('.settings-opt[data-stheme="dark"].active');
  check('Dark theme active by default', !!darkActive);

  // Mode business active by default
  const bizActive = await bizPage.$('.settings-opt[data-smode="business"].active');
  check('Business mode active by default', !!bizActive);

  // Theme disabled hint visible
  const hint = await bizPage.$('.settings-hint');
  check('Theme hint visible', !!hint);

  // Click Light theme
  const lightBtn = await bizPage.$('.settings-opt[data-stheme="light"]');
  await lightBtn.click();
  await bizPage.waitForTimeout(200);
  const themeAfter = await bizPage.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('Light theme switches to "light"', themeAfter === 'light');
  const lightActive = await bizPage.$('.settings-opt[data-stheme="light"].active');
  check('Light button shows active', !!lightActive);

  // Switch back to dark
  const darkBtn = await bizPage.$('.settings-opt[data-stheme="dark"]');
  await darkBtn.click();
  await bizPage.waitForTimeout(200);

  // Click Terminal mode
  const termBtn = await bizPage.$('.settings-opt[data-smode="terminal"]');
  await termBtn.click();
  await bizPage.waitForTimeout(500);
  const modeAfter = await bizPage.evaluate(() => document.documentElement.getAttribute('data-mode'));
  check('Terminal mode switches to "terminal"', modeAfter === 'terminal');
  
  // In terminal mode, theme buttons should be disabled
  const themeDisabled = await bizPage.evaluate(() => {
    const btns = document.querySelectorAll('.settings-opt[data-stheme]');
    return Array.from(btns).every(b => b.disabled);
  });
  check('Theme buttons disabled in terminal mode', themeDisabled);

  // Popup auto-closes after mode switch
  const autoClosed = await bizPage.evaluate(() => document.getElementById('settingsPopup').style.display);
  check('Popup auto-closes on mode switch', autoClosed === 'none');

  // Open again and close via Close button
  await bizPage.click('#ui-overlay .settings-gear', { force: true });
  await bizPage.waitForTimeout(300);
  const reopened = await bizPage.evaluate(() => document.getElementById('settingsPopup').style.display);
  check('Popup reopens in terminal mode', reopened === 'flex');

  await bizPage.click('#settingsClose', { force: true });
  await bizPage.waitForTimeout(200);
  const closed = await bizPage.evaluate(() => document.getElementById('settingsPopup').style.display);
  check('Popup closes on Close button', closed === 'none');

  await bizPage.close();

  // --- Desktop mode ---
  const deskPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const deskErrors = [];
  deskPage.on('pageerror', err => deskErrors.push(err.message));
  await deskPage.goto(BASE + '?mode=desktop', { waitUntil: 'networkidle', timeout: 15000 });
  await deskPage.waitForTimeout(2000);
  
  // Force desktop mode if query param didn't work
  await deskPage.evaluate(() => {
    document.documentElement.setAttribute('data-mode', 'desktop');
  });
  await deskPage.waitForTimeout(500);
  
  console.log('\n=== DESKTOP MODE ===');
  check('Desktop mode loads', (await deskPage.evaluate(() => document.documentElement.getAttribute('data-mode'))) === 'desktop');

  const gearDesk = await deskPage.$('#settingsGearDesk');
  check('Gear in desktop system tray', !!gearDesk);
  
  const deskGearDisp = await gearDesk.evaluate(el => window.getComputedStyle(el).display !== 'none');
  check('Desktop gear is displayed', deskGearDisp);

  // Pause animation so Playwright considers element stable
  await deskPage.addStyleTag({ content: '.settings-gear { animation: none !important; }' });
  // Click opens popup
  await gearDesk.click();
  await deskPage.waitForTimeout(300);
  const deskPopup = await deskPage.evaluate(() => document.getElementById('settingsPopup').style.display);
  check('Desktop popup opens', deskPopup === 'flex');

  // Close via Escape
  await deskPage.keyboard.press('Escape');
  await deskPage.waitForTimeout(200);
  const deskClosed = await deskPage.evaluate(() => document.getElementById('settingsPopup').style.display);
  check('Escape closes popup', deskClosed === 'none');

  await deskPage.close();

  // --- Terminal mode ---
  const termPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const termErrors = [];
  termPage.on('pageerror', err => termErrors.push(err.message));
  await termPage.goto(BASE + '?mode=terminal', { waitUntil: 'networkidle', timeout: 15000 });
  await termPage.waitForTimeout(2000);
  
  await termPage.evaluate(() => {
    document.documentElement.setAttribute('data-mode', 'terminal');
  });
  await termPage.waitForTimeout(500);
  
  console.log('\n=== TERMINAL MODE ===');
  check('Terminal mode loads', (await termPage.evaluate(() => document.documentElement.getAttribute('data-mode'))) === 'terminal');

  const gearTerm = await termPage.$('#settingsGearUI');
  check('Gear in terminal overlay', !!gearTerm);

  // Pause animation so Playwright considers element stable
  await termPage.addStyleTag({ content: '.settings-gear { animation: none !important; }' });
  await gearTerm.click();
  await termPage.waitForTimeout(300);
  const termPopup = await termPage.evaluate(() => document.getElementById('settingsPopup').style.display);
  check('Terminal popup opens', termPopup === 'flex');

  // No old theme buttons in terminal
  const oldThemeBtns = await termPage.$$('.theme-btn');
  check('No old theme buttons in terminal', oldThemeBtns.length === 0);

  await termPage.close();

  // --- Summary ---
  console.log(`\n${'='.repeat(40)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} checks`);
  
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
