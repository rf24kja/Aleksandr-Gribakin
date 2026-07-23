### Task 2: Wire Microcopy into Form Validation + 404 Page

**Goal:** Connect the FORM_ERRORS locale keys to form validation, add 404 page.

**Files:**
- Modify: `src/lib/validation.js`
- Modify: `src/core/orchestrator.js`
- Modify: `index.html`
- Already done in Task 1: locale keys added to `src/config/ponytail.config.js`

- [ ] **Step 1: Change `validateField` in `validation.js` to return error keys**

Replace `validateField` function (lines 35-48) to return error type keys instead of resolved strings:

```js
function validateField(field, value, lang) {
  const rule = VALIDATION.RULES[field];
  if (!rule) return null;
  const val = rule.normalize ? rule.normalize(value) : value.trim();
  if (rule.required && !val) return 'required';
  if (rule.min && val.length < rule.min) return 'min';
  if (rule.max && val.length > rule.max) return 'max';
  if (rule.pattern && !rule.pattern.test(val)) return 'pattern';
  return null;
}
```

Note: The `VALIDATION.ERRORS` object with hardcoded strings can now be removed (it's unused).

- [ ] **Step 2: Update `_renderFormErrors` in `orchestrator.js` to use locale keys**

Replace the method body (lines 471-481):

```js
_renderFormErrors(form, errors) {
    form.querySelectorAll('[data-field-error]').forEach((el) => { el.textContent = ''; el.style.opacity = '0'; });
    const c = form.querySelector('[data-form-errors]');
    if (c) c.textContent = '';
    const t = PONYTAIL.LOCALE[this.s.lang]?.FORM_ERRORS || {};
    let first = true;
    Object.entries(errors).forEach(([field, key]) => {
      const el = form.querySelector(`[data-field-error="${field}"]`);
      if (!el) return;
      // _api = network/rate limit errors from fetch
      if (field === '_api') {
        const msg = (key + '').toLowerCase().includes('rate') ? t.RATE_LIMIT : t.NETWORK;
        el.textContent = msg || key;
      } else {
        const lookup = (field + '_' + key).toUpperCase(); // e.g. NAME_REQUIRED, EMAIL_PATTERN
        el.textContent = t[lookup] || key;
      }
      el.style.opacity = '1';
      if (first && c && field !== '_api') { c.textContent = el.textContent; first = false; }
    });
  }
```

- [ ] **Step 3: Add FORM_ERRORS fallback keys for missing cases**

Since `FORM_ERRORS` only has `NAME_REQUIRED`, `EMAIL_REQUIRED`, `EMAIL_INVALID`, `MSG_REQUIRED`, add fallback entries in `ponytail.config.js` EN:

```js
// In EN FORM_ERRORS add:
NAME_MIN: 'Name must be at least 2 characters',
NAME_MAX: 'Name is too long',
NAME_PATTERN: 'Name contains invalid characters',
EMAIL_PATTERN: 'That does not look like an email',
MSG_MIN: 'Message must be at least 10 characters',
MSG_MAX: 'Message is too long (max 2000)',
```

```js
// In RU FORM_ERRORS add:
NAME_MIN: 'Имя должно содержать минимум 2 символа',
NAME_MAX: 'Имя слишком длинное',
NAME_PATTERN: 'Имя содержит недопустимые символы',
EMAIL_PATTERN: 'Это не похоже на email',
MSG_MIN: 'Сообщение должно содержать минимум 10 символов',
MSG_MAX: 'Сообщение слишком длинное (макс. 2000)',
```

- [ ] **Step 4: Add 404 section HTML to index.html**

Add before `</body>`:

```html
<div id="page404" style="display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9997;background:var(--bg);flex-direction:column;align-items:center;justify-content:center;font-family:var(--font-mono);text-align:center;gap:12px;">
  <div style="font-size:48px;color:var(--accent);font-weight:200;">404</div>
  <div data-i18n="_PAGE_404.TITLE" style="font-size:14px;color:var(--text-bright);"></div>
  <div data-i18n="_PAGE_404.SUB" style="font-size:11px;color:var(--text-dim);"></div>
  <button data-i18n="_PAGE_404.CTA" style="margin-top:8px;padding:8px 20px;background:transparent;border:1px solid var(--accent);color:var(--accent);font-family:var(--font-mono);cursor:pointer;" onclick="window.location.hash=''">Return Home</button>
</div>
```

- [ ] **Step 5: Wire 404 display in hash router**

In `_wireHashRouter()` in orchestrator.js (line 563), after the `closeProjectDetail()` call:

```js
// Show 404 for unmatched hashes
if (h && !handled) {
  document.getElementById('page404').style.display = 'flex'
  this._applyI18n()
  return
}
```

Also, when a valid route is matched, hide 404:

```js
const pd = document.getElementById('projectDetail');
if (pd) {
  if (pd.classList.contains('active')) closeProjectDetail();
  document.getElementById('page404').style.display = 'none';
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/validation.js src/core/orchestrator.js index.html src/config/ponytail.config.js
git commit -m "feat: wire form validation to locale keys, add 404 page with i18n"
```
