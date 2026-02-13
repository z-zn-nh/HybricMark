# Progress - 2026-02-13 Footnote Rendering Fix

## Scope
- Fix context-menu footnote insertion showing raw markdown syntax (`[^1]`) in editor.

## Changes
- Updated `insertFootnote` in `src/lib/components/EditorContextMenu.tsx`:
  - no longer inserts raw markdown `[^key]` and `[^key]: content`
  - now inserts superscript reference directly (`[key]` with `superscript` mark)
  - inserts footnote definition as plain paragraph below current block (`[key]: content`)
- Added helper `normalizeFootnoteKey` for stable key formatting.

## Result
- Footnote reference displays as superscript, not raw markdown marker.
- Avoids the previous style mismatch caused by unparsed markdown syntax.

## Validation
- `npm run lint` ?
- `npm run build` ?
