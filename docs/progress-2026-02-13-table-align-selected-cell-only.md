# Progress - 2026-02-13 - Table Align Selected Cell Only

## Scope
- File: `src/lib/components/HybricEditor.tsx`
- Goal: Table align buttons should only affect selected cell(s), matching Tiptap table behavior.

## Changes
1. Imported `CellSelection` from `@tiptap/pm/tables`.
2. Added `isTableCellSelection` type guard for robust selected-cell range detection.
3. Updated `withTableSelection`:
- Preserve `CellSelection` and avoid converting it when toolbar buttons are clicked.
- Use `editor.view.focus()` instead of command focus in selected-cell mode.
- When restoring selection from cell position, move cursor into cell (`rawPos + 1`) to avoid no-op actions.
4. Updated `applyTableAlign`:
- Use `setCellAttribute("textAlign", ...)` without whole-table focus chain.
- Alignment now targets selected cell(s) only.

## Validation
- `npm run lint` passed.
- `npm run build` passed.
