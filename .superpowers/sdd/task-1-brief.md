### Task 1: Add Microcopy Locale Keys

**Files:**
- Modify: `src/config/ponytail.config.js:1-202`

- [ ] **Step 1: Add EN locale keys for validation errors, 404, empty states**

```js
// Add to EN object (around line 77, before COFFEE:)
FORM_ERRORS: {
  NAME_REQUIRED: 'Enter your name',
  EMAIL_REQUIRED: 'Enter your email',
  EMAIL_INVALID: 'That does not look like an email',
  MSG_REQUIRED: 'Describe your project briefly',
  NETWORK: 'Network error. Try again later.',
  RATE_LIMIT: 'Slow down. One message at a time.',
},
_PAGE_404: {
  TITLE: '404 — Page Not Found',
  SUB: 'This route does not exist.',
  CTA: 'Return Home',
},
```

```js
// Add to RU object (around line 148, before COFFEE:)
FORM_ERRORS: {
  NAME_REQUIRED: 'Введите ваше имя',
  EMAIL_REQUIRED: 'Введите ваш email',
  EMAIL_INVALID: 'Это не похоже на email',
  MSG_REQUIRED: 'Опишите ваш проект кратко',
  NETWORK: 'Ошибка сети. Попробуйте позже.',
  RATE_LIMIT: 'Не так быстро. По одному сообщению.',
},
_PAGE_404: {
  TITLE: '404 — Страница не найдена',
  SUB: 'Этот маршрут не существует.',
  CTA: 'Вернуться на главную',
},
```

- [ ] **Step 2: Add form placeholder polish — more personality-driven variants**

```js
// Replace existing FORM.PLACEHOLDER_NAME in EN (line 77):
PLACEHOLDER_NAME: 'Your name, or your best alias',

// Replace existing FORM.PLACEHOLDER_EMAIL in EN (line 77):
PLACEHOLDER_EMAIL: 'where pixels meet purpose',

// Replace existing FORM.PLACEHOLDER_MSG in EN (line 77):
PLACEHOLDER_MSG: 'Product, team, dream — paint the picture...',

// Replace existing FORM.PLACEHOLDER_NAME in RU (line 150):
PLACEHOLDER_NAME: 'Имя или лучший псевдоним',

// Replace existing FORM.PLACEHOLDER_EMAIL in RU (line 150):
PLACEHOLDER_EMAIL: 'туда, где живёт идея',

// Replace existing FORM.PLACEHOLDER_MSG in RU (line 150):
PLACEHOLDER_MSG: 'Продукт, команда, мечта — опишите картину...',
```

- [ ] **Step 3: Commit**

```bash
git add src/config/ponytail.config.js
git commit -m "feat: add microcopy locale keys for validation, 404, form placeholders"
```
