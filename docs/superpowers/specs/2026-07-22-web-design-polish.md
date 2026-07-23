# Web Design Polish — Aleksandr Gribakin Portfolio

## Scope

5 phases of incremental design improvements, ordered from lowest-risk to highest-effort:

## Phase 1 — Microcopy (#13)

**Files:** `index.html` (form placeholders, 404 text, validation errors), `ponytail.config.js` (locale keys)

**Changes:**
- Add locale keys for: 404 title/message, form validation errors (name required, invalid email), empty states, CTA button loading text
- Polish existing microcopy: make form placeholders more personality-driven ("your@email.com" → "where pixels meet purpose"), add helper text below fields
- Add 404 HTML section (hidden by default, shown on route mismatch)
- Add `_FORM_ERROR_` keys to EN/RU locale

**Ponytail:** Inline in index.html, no new files. Use existing `data-i18n`.

## Phase 2 — Accessibility (#24)

**Files:** `index.html`, `src/effects/` (scene init), `src/styles/` (ponytail: everything is in index.html style block)

**Changes:**
- **Skip-to-content link**: first focusable element, visible on focus, targets `#mainContent`
- **`:focus-visible`** outlines: 2px solid `var(--accent)` offset 2px on all interactive elements
- **`prefers-reduced-motion`**: media query disables scroll-triggered animations, Three.js auto-pauses, removes scanline overlay, removes glitch preloader
- **ARIA**: `aria-current="page"` on active scene label, `aria-live="polite"` on dynamic content (stats count-up, detail panel), `role="alert"` on form errors
- **Color contrast**: ensure all text-on-bg combos meet WCAG AA (4.5:1). Adjust `--text-dim` if needed.

**Ponytail:** CSS media query + a few aria attrs. No framework.

## Phase 3 — Mobile-First (#10)

**Files:** `index.html`, scene files, `src/effects/orchestrator.js`

**Changes:**
- **Touch feedback**: `@media (hover: none) { .card-inner { pointer-events: auto; tap-highlight-color: rgba(...); } }` — enable tap-to-open with visual feedback
- **`srcSet`** on portrait: add 2x/3x variants, use `<picture>` or `srcset` attribute
- **Tap targets**: ensure all buttons/links are ≥44×44px; enlarge theme switcher buttons if needed
- **Mobile 3D fallback**: on devices < 768px AND low FPS after 3s, disable Three.js render loop (show static poster frame per scene)
- **Viewport meta**: ensure proper `viewport` with `minimum-scale=1`

**Ponytail:** CSS mostly. 3D fallback = single call to scene manager.

## Phase 4 — Micro-animations (#23)

**Files:** `index.html`, scene orchestrator, CSS

**Changes:**
- **Career items hover**: add scale + border-left expand (0.2s cubic-bezier)
- **Achievement items hover**: add glow translateY(-2px) with box-shadow transition
- **Detail panel loading**: add CSS skeleton shimmer (pulsing gradient) before content renders
- **Smooth section transitions**: add `opacity` + `transform: translateY(10px)` transition on overlay enter/exit (already partially done — standardise)
- **Theme switcher micro-interaction**: active theme gets a subtle pulse/keyframe on change
- **CTA button**: add loading spinner (CSS-only) during form submit

**Ponytail:** Pure CSS keyframes + 2-3 lines of JS. No library needed.

## Phase 5 — Self-critique Review (#29)

**Changes:**
- Review pass over all 4 themes: check consistency of accent usage, spacing, border treatments
- Remove scanline overlay from Cyber and Dark themes (keep for Terminal/Steampunk only — better thematic fit)
- Add `clamp()` fluid type to section headers (currently fixed sizes)
- Review all transitions for easing consistency (use `cubic-bezier(0.4, 0, 0.2, 1)` everywhere)
- One final check: FPS impact of all changes; run bloom at medium on mobile by default

## Order of implementation

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
Each phase is independently verifiable. No phase blocks another.

## Constraints

- No new dependencies
- No build tool changes
- All CSS in `index.html` `<style>` block (existing pattern)
- All text via `PONYTAIL.LOCALE` — never hardcoded
- Each change must be testable by scrolling through the page
- FPS must stay ≥ 45 on target hardware after changes
