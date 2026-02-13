# Progress - 2026-02-13 Footnote Token Render Stabilization

## Problem
- Footnote tokens rendered with visual artifacts (`[`, `^1]` split) and stale raw syntax around cursor boundary.

## Fix
- Reworked footnote token rendering strategy in `HybricEditor` decoration plugin:
  - no longer replaces full token text with pseudo content
  - keeps native token text and only hides the caret character `^` with a dedicated inline decoration
  - strict editing-boundary rule (`selectionFrom > from && selectionTo < to`) to avoid false "editing" state when cursor is just before/after token
- Applied to both reference token `[^x]` and definition token `[^x]:` display.

## CSS
- Removed pseudo-content based footnote token rendering.
- Added `.hm-footnote-caret-hidden` to hide only `^` visually.
- Kept clickable blue reference style and right-top back-jump button behavior.

## Validation
- `npm run lint` ?
- `npm run build` ?
