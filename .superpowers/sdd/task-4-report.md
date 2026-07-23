# Task 4 Report: Mobile-First Improvements

**Status:** Complete  
**SHA:** 0842be8fcf1d811dc7d44f407b24a97b2d5b47da  
**Date:** 2026-07-22

## Changes

### index.html
- **Touch feedback:** Replaced `pointer-events: none` on `.project-card .card-inner` with `-webkit-tap-highlight-color`, `pointer-events: auto`, and `:active` background on `.project-card` (max-width 768px)
- **srcSet:** Added `srcset` (1x/2x) and `decoding="async"` to portrait `<img>`
- **Tap targets:** `.theme-btn` → 40×40px, `.lang-toggle` → 10px/16px padding + 12px font, `.coffee-egg` → 44×44px

### src/main.js
- **3D fallback:** After 5s, if FPS < 30 on mobile (<768px), stops animation loop and hides the WebGL canvas

**Commit:** `0842be8` — `feat: mobile-first — touch feedback, srcSet, tap targets, 3D fallback`
