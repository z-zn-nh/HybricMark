# Progress - 2026-02-12 (Table Toolbar + Context Menu Repair)

## Summary
- Converted table floating toolbar to fixed top-left anchor of active table.
- Removed right-side floating actions; kept left compact controls.
- Added table size picker (rows/cols) as the left-most toolbar action.
- Updated context-menu table actions to Chinese labels.
- Changed table insertion from fixed 3x3 to prompted row/column confirmation.
- Fixed merge action reliability (auto-select adjacent cell when single-cell context, split fallback supported).

## Files Changed
- `src/lib/components/HybricEditor.tsx`
- `src/lib/components/EditorContextMenu.tsx`
- `src/lib/styles/editor.css`

## Validation
- `npm run lint` passed.
- `npm run build` passed.
- Playwright checks:
  - toolbar anchored at table top-left
  - row/col picker can adjust table size
  - context menu table labels are Chinese
  - insert table prompts for rows/cols (validated with 4x5)
  - merge/split action now executes (observed merged cell with `colspan=2`)
