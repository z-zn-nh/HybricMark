# Progress - 2026-02-13 Footnote Hybrid Style/Jump Fix

## Goal
- Keep footnote reference style as clickable superscript `[1]` (Typora-like behavior)
- Render footnote definition line as plain markdown-style `[1]: content`

## Changes
- Updated `insertFootnote` in `src/lib/components/EditorContextMenu.tsx`.
- Reference insertion now uses text `[key]` with marks:
  - `superscript`
  - `link` to local anchor `#fn-...`
- Definition insertion now creates a paragraph below current block with:
  - text format: `[key]: content`
  - explicit anchor id on paragraph (for hash jump target)
- Added helpers:
  - `createFootnoteTargetId`
  - reused `normalizeFootnoteKey`

## Validation
- `npm run lint` ?
- `npm run build` ?
