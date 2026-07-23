# Task 5 — Micro-animations Report

**Status:** DONE

**Commit SHA:** 648df4b0ba9335620716ccddae05490f1763e05c

## Changes

### index.html CSS
- `.career-item` transition eased to `.3s cubic-bezier(.4,0,.2,1)`, hover now adds `border-left: 2px solid var(--accent)`, `scale(1.01)`, tinted bg
- `.achievement-item:hover` now does `translateY(-2px)`, updated shadow stack, accent border
- Skeleton shimmer (`@keyframes skeleton-pulse`, `.pd-skeleton` classes) inserted before `#projectDetail` rule
- `.section-overlay` transition standardised to `.5s cubic-bezier(.4,0,.2,1)`
- `.theme-btn.active` gets `animation: theme-activate .4s ease` with glow pulse keyframes
- Loading spinner (`.terminal-form button[type="submit"].loading`) added after `:disabled` rule

### orchestrator.js
- `_showSkeleton()` method added — fills `#projectDetail` with skeleton HTML + sets `.active`
- Skeleton called before all 6 render call sites (`_wireProjectClicks`, `_wireCareerAchClicks`, `_wireHashRouter`)
- `.loading` class toggled on submit button before `animateSubmission`, removed in catch block and `_showFormSuccess`

## Concerns
- **`_wireHashRouter` ordering:** The hash router calls `renderProjectPage`/etc. *before* the existing `closeProjectDetail()` check (lines 586-590). This means the skeleton panel is shown and then immediately closed if the panel was already active. This is a pre-existing ordering issue in `_wireHashRouter` — not introduced by this task, but it may cause a flash. If the skeleton appears and disappears, that's the cause.
- Call site detection: the function names matched exactly (`renderProjectPage`, `renderCareerPage`, `renderAchievementPage`), no name-mapping needed.
