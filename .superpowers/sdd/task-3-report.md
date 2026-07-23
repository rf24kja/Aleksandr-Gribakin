# Task 3: Accessibility Report

**Status:** DONE

**Commit SHA:** 6056d10

**Changes:**
- Added `SKIP_LINK` locale keys (EN/RU) to ponytail.config.js
- Added skip-to-content anchor as first child of `<body>`
- Wrapped main content in `<div id="mainContent">` for skip-link target
- Added skip-link CSS (offscreen → focus visible at top)
- Added `:focus-visible` styles with mouse-use fallback
- Added `prefers-reduced-motion: reduce` media query with animation/transform overrides
- Added reduced-motion check in main.js (sets `data-reduced-motion`, dispatches `fx:quality:low`)
- Added ARIA attributes: `aria-live="polite" aria-label="Statistics"` on statsGrid, `aria-live="polite" role="status"` on scene-label, `aria-label="Submit contact form"` on submit button
- Added `aria-current="true"` to active theme button in applyTheme()
