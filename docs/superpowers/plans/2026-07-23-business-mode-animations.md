# Business Mode Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add hover effects, entrance micro-animations, stats counter animation, and smooth scroll navigation to business mode.

**Architecture:** Pure CSS for hover/entrance (no JS dependency for visibility). IntersectionObserver for triggering one-shot entrance + stats. RAF for counter animation. All business-mode-only.

**Tech Stack:** CSS @keyframes + transition, IntersectionObserver API, requestAnimationFrame

## Global Constraints

- Business mode only — all CSS under `[data-mode="business"]`, all JS checks `IS_BUSINESS`
- No new dependencies
- Content always visible regardless of animation state
- One-shot entrance animations (class `.entered`)

---

### Task 1: CSS — Hover Effects + Entrance + Tab Indicator

**Files:**
- Modify: `index.html` (business mode CSS block, ~line 1100+)

- [ ] **Step 1: Add hover effects for career, project, achievement cards**

Insert after the career hover CSS (~line 1128). Find `[data-mode="business"] .career-item:hover` and replace its content:

```css
[data-mode="business"] .career-item:hover {
  border-color: rgba(233,84,32,.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
  background: var(--b-bg2);
}
```

Find `[data-mode="business"] .project-card:hover` (~line 1237) and replace:

```css
[data-mode="business"] .project-card:hover {
  border-color: rgba(233,84,32,.25);
  box-shadow: 0 4px 20px rgba(0,0,0,.12);
  transform: translateY(-2px);
}
```

Find `[data-mode="business"] .achievement-item:hover` (~line 1331) and replace:

```css
[data-mode="business"] .achievement-item:hover {
  border-color: rgba(233,84,32,.2);
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
  transform: translateY(-1px);
}
```

- [ ] **Step 2: Add stats accent on hover**

Find `[data-mode="business"] .stat-item` block (~line 1094). Add after `.stat-item .stat-label` rule:

```css
[data-mode="business"] .stat-item:hover .stat-value {
  color: var(--b-accent);
  transition: color .2s ease;
}
```

- [ ] **Step 3: Add category tab active indicator**

Find `.cat-tab` rules (~line 1189). Add `position: relative` to `.cat-tab` and a `::after` pseudo-element for active state:

Before `.cat-tab:hover` rule, insert:
```css
[data-mode="business"] .cat-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--b-accent);
  transition: opacity .2s;
}
```

Find `.cat-tab` base rule and add `position: relative`:
```css
[data-mode="business"] .cat-tab {
  position: relative;
  ...
}
```

- [ ] **Step 4: Add entrance keyframes and .entered class**

Find the end of the `[data-mode="business"]` CSS block, before the light theme overrides. Add:

```css
/* Entrance micro-animation */
@keyframes biz-entrance {
  0%   { transform: translateY(6px) scale(0.99); opacity: .7; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
[data-mode="business"] .entered {
  animation: biz-entrance 0.35s ease-out forwards;
}
```

- [ ] **Step 5: Commit CSS changes**

```bash
git add index.html
git commit -m "style(business): hover effects, entrance animation, tab indicator"
```

---

### Task 2: JS — Entrance Observer + Stats Counter + Smooth Scroll

**Files:**
- Modify: `src/core/orchestrator.js`

- [ ] **Step 1: Add `_observeEntrance()` method**

Find `_animateStatsCount()` (~line 236). Insert before it:

```js
  _observeEntrance() {
    if (this._entranceObserved) return;
    this._entranceObserved = true;
    let statsCounted = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('entered');
          obs.unobserve(entry.target);
        }
      });
      // Trigger stats animation once when any stat-item appears
      if (!statsCounted && entries.some(e => e.target.classList.contains('stat-item') && e.isIntersecting)) {
        statsCounted = true;
        this._animateStatsCount();
      }
    }, { threshold: 0.1 });
    document.querySelectorAll('.career-item, .project-card, .achievement-item, .stat-item')
      .forEach(el => obs.observe(el));
  }
```

- [ ] **Step 2: Update `_renderContent()` to call `_observeEntrance()`**

Replace the end of `_renderContent()`:

```js
  _renderContent() {
    if (this._rendered) return;
    this._rendered = true;
    this._activeCat = this._l().CATEGORIES[0];
    this._renderStats();
    this._renderCareer();
    this._renderCategoryTabs();
    this._renderProjects();
    this._renderAchievements();
    this._applyI18n();
    this._observeEntrance(); // <-- add this
  }
```

- [ ] **Step 3: Update `_reRenderContent()` similarly**

```js
  _reRenderContent() {
    this._activeCat = this._l().CATEGORIES[0];
    this._renderStats();
    this._renderCareer();
    this._renderCategoryTabs();
    this._renderProjects();
    this._renderAchievements();
    this._applyI18n();
    // Reset entrance observer on language change
    this._entranceObserved = false;
    this._observeEntrance();
  }
```

- [ ] **Step 4: Keep `_animateStatsCount()` — already exists, just connect to observer**

The existing method at line 236 already does the right thing. No changes needed.
The entrance observer (Step 1) will call `this._animateStatsCount()` when stats section is first intersected.
The existing scroll-based trigger in `_updateOverlays()` (line 309) also calls it — `_statsCounted` guard prevents double-fire.

- [ ] **Step 5: Add smooth scroll for nav links**

In `_wireHashRouter()`, inside the `checkHash` function, after the detail page handlers (~line 593), handle anchor links:

```js
      // Smooth scroll for business mode anchor links
      if (h && !handled && document.documentElement.getAttribute('data-mode') === 'business') {
        const targetId = h.replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
          document.getElementById('page404').style.display = 'none';
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
          return;
        }
      }
```

Also, add click handlers for `[data-scroll-to]` elements. Find `_wireHashRouter()` - after `window.addEventListener('hashchange', checkHash)`, add:

```js
    // Smooth scroll on nav link click (business mode)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-scroll-to]');
      if (!link) return;
      if (document.documentElement.getAttribute('data-mode') !== 'business') return;
      e.preventDefault();
      const targetId = link.getAttribute('data-scroll-to');
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', `#${targetId}`);
      }
    });
```

- [ ] **Step 6: Commit JS changes**

```bash
git add src/core/orchestrator.js
git commit -m "feat(business): entrance observer, smooth scroll, stats counter fix"
```
