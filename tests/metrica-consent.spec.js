import { expect, test } from '@playwright/test';

const KEY = 'dev24_metrica_consent_v1';
test.beforeEach(async ({ page }) => {
  await page.route(/mc\.yandex\.|mc\.webvisor\./, route => route.abort());
  await page.route(/googletagmanager\.com|google-analytics\.com/, route => route.abort());
  await page.route('**/_vercel/insights/**', route => route.fulfill({ status:200,contentType:'application/javascript',body:'' }));
  await page.route('**/api/consult', route => route.abort());
});
test('new Metrica stays unloaded until explicit consent', async ({ page }) => {
  const requests=[];page.on('request',r=>{if(r.url().includes('mc.yandex'))requests.push(r.url());});
  await page.goto('/');
  await expect(page.locator('[data-metrica-consent]')).toBeVisible();
  expect(requests).toEqual([]);
  await expect(page.locator('meta[name="yandex-metrica"]')).toHaveAttribute('content','114040235');
  await page.locator('[data-metrica-accept]').click();
  await expect.poll(()=>page.evaluate(()=>window.ym?.a?.filter(a=>a[1]==='init').length||0)).toBe(1);
  const calls=await page.evaluate(()=>(window.ym.a||[]).map(a=>Array.from(a)));
  expect(calls.find(a=>a[1]==='init')[2]).toMatchObject({defer:true,ssr:true,webvisor:true,clickmap:true,ecommerce:'dataLayer'});
  expect(calls.filter(a=>a[1]==='hit')).toHaveLength(1);
  await page.locator('[data-metrica-settings]').click();
  expect(await page.evaluate(()=>Array.from(window.ym.a.at(-1)))).toEqual(['114040235','destruct']);
  await page.locator('[data-metrica-decline]').click();
  expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBe('declined');
  await page.reload();
  expect(await page.evaluate(()=>typeof window.ym)).toBe('undefined');
});

test('initial rejection persists without loading Metrica',async({page})=>{
  const requests=[];page.on('request',r=>{if(r.url().includes('mc.yandex'))requests.push(r.url());});
  await page.goto('/');await page.locator('[data-metrica-decline]').click();await page.reload();
  await expect(page.locator('[data-metrica-settings]')).toBeVisible();
  await expect(page.locator('[data-metrica-consent]')).toHaveCount(0);
  expect(requests).toEqual([]);expect(await page.evaluate(()=>typeof window.ym)).toBe('undefined');
});

test('accepted visits mask dynamic fields, strip private URLs and reaccept without duplicate script',async({page})=>{
  await page.addInitScript(key=>localStorage.setItem(key,'accepted'),KEY);
  await page.goto('/?email=private-test@example.com#private-test-fragment');
  await expect.poll(()=>page.evaluate(()=>window.ym?.a?.length||0)).toBeGreaterThan(1);
  await page.evaluate(()=>{const form=document.createElement('form');form.id='mask-test';form.innerHTML='<input><textarea></textarea><div contenteditable="true"></div>';document.body.appendChild(form);});
  await expect(page.locator('#mask-test')).toHaveClass(/ym-hide-content/);
  for(const field of ['input','textarea','[contenteditable]'])await expect(page.locator('#mask-test '+field)).toHaveClass(/ym-disable-keys/);
  await expect(page.locator('#terminalShell')).toHaveClass(/ym-hide-content/);
  const calls=await page.evaluate(()=>window.ym.a);
  expect(JSON.stringify(calls)).not.toContain('private-test');
  const init=calls.find(a=>a[1]==='init')[2];expect(new URL(init.url).search).toBe('');
  await page.locator('[data-metrica-settings]').click();
  const before=await page.evaluate(()=>window.ym.a.length);
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('mode:change',{detail:{to:'terminal'}})));
  expect(await page.evaluate(()=>window.ym.a.length)).toBe(before);
  await page.locator('[data-metrica-accept]').click();
  await expect(page.locator('script[src*="mc.yandex.ru/metrika/tag.js"]')).toHaveCount(1);
  expect(await page.evaluate(()=>window.ym.a.filter(a=>a[1]==='init').length)).toBe(2);
});

test('Russian mobile consent and policy disclose provider-specific choice',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/ru');
  const panel=page.locator('[data-metrica-consent]');await expect(panel).toContainText('Необязательная аналитика');
  const box=await panel.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);
  await expect(panel.locator('a')).toHaveAttribute('href','/ru/privacy');
  // Vite preview needs the directory slash; Vercel cleanUrls handles the public alias.
  await page.locator('[data-metrica-decline]').click();await page.goto('/ru/privacy/');
  await expect(page.locator('body')).toContainText('114040235');
  expect(await page.evaluate(()=>typeof window.ym)).toBe('undefined');
});
