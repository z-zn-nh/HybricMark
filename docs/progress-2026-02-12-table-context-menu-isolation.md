# 2026-02-12 Table Context Menu Isolation

## Goal
- Make table context menu independent from generic text/block context menus.

## Implementation
- In `EditorContextMenu.tsx`, added a new mode: `table`.
- On `contextmenu` capture, detect if right-click position resolves inside a table node.
- If inside table, force menu mode to `table` and render only table operations.
- Kept non-table behavior unchanged.

## Table-only Menu Items
- Insert Column Left / Right
- Delete Column
- Insert Row Above / Below
- Delete Row
- Merge Cells
- Delete Table

## Verification
- `npm run lint` passed
- `npm run build` passed
