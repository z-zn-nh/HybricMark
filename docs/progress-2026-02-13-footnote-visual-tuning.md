# Progress - 2026-02-13 Footnote Visual Tuning

## Scope
- Further tune footnote reference rendering based on visual feedback.

## Changes
1. Footnote reference insertion
- `src/lib/components/EditorContextMenu.tsx`
- `insertFootnote` now inserts superscript number only (`1`) instead of bracketed form (`[1]`).

2. Superscript visual stability
- `src/lib/styles/editor.css`
- Updated `sup` style to avoid clipped/awkward glyph appearance:
  - `line-height: 1`
  - `vertical-align: baseline`
  - `position: relative; top: -0.45em`
  - `margin-left: 0.12em`

## Validation
- `npm run lint` ?
- `npm run build` ?
