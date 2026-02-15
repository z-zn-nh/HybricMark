# Progress - 2026-02-15 - Nextra System Text i18n Fill

## Goal
Complete remaining framework-level UI localization after language toggle:
- On This Page
- Scroll to top
- Last updated on
- Search placeholder
- Light / Dark / System labels

## Implementation
Updated `www/components/site/I18nProvider.tsx`:

1. Added a framework text map (`UI_TEXT`) for EN/ZH equivalents.
2. Added `patchNextraUi(language)` to patch static framework text after hydration.
3. Added support for both placeholder styles:
   - `Search documentation...`
   - `Search documentation…`
4. Added mutation observer patching for route changes and late-rendered sections.
5. Added anti-loop safeguards:
   - only update when target text is different
   - microtask-based reentrancy guard in observer callback

## Validation
- Build passed locally (`npm run build` in `www`).
- Intended behavior: when language is switched, framework text above follows selected locale instead of remaining in English.

## Notes
This patch intentionally stays in the docs app layer and does not alter editor library runtime behavior.
