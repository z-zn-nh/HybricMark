# Progress - 2026-02-12 (Table Tooltip Left-Only Follow-Cell Fix)

## Scope
- Keep only the left table floating action group.
- Ensure floating toolbar follows active cell position reliably.
- Fix unstable table actions when focus/selection drifts.

## Changes
- Updated `src/lib/components/HybricEditor.tsx`:
  - Added `cellPos` to tooltip state for stable command targeting.
  - Added `resolveTableSelection()` helper to locate active `tableCell/tableHeader` and parent `table`.
  - Added `withTableSelection()` wrapper so table commands always execute against the current cell context.
  - Switched toolbar actions (`toggleHeaderRow`, `setCellAttribute(textAlign)`) to run through `withTableSelection()`.
  - Kept toolbar as left-only group (`Table2`, align-left/center/right), removed right-side action area.

## Validation
- `npm run lint` passed.
- `npm run build` passed.
- Playwright checks:
  - Toolbar remains left-only (4 buttons).
  - Toolbar x-position follows active cell.
  - Header toggle works (`TH` -> `TD`).
  - Align buttons apply cell style (`text-align: center/right`).
  - Context menu table ops tested: `Insert Row Below`, `Delete Column` both effective.
