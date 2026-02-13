# 2026-02-12 Typora-style Table UI Update

## What changed
- Added a Typora-like table floating toolbar in `HybricEditor`.
- Toolbar appears when cursor/focus is inside a table and is positioned above the table area.
- Included quick actions:
  - Toggle header row
  - Align left / center / right (visual alignment via `data-align` on table DOM)
  - More icon (hints to right-click menu for advanced ops)
  - Delete table

## Kept behavior
- Existing independent table right-click menu remains as the primary advanced operations surface.
- Other editor interactions unchanged.

## Styling
- Added `hm-table-tooltip*` styles in `src/lib/styles/editor.css`.
- Added table align styles for `table[data-align="left|center|right"]`.

## Verification
- `npm run lint` passed
- `npm run build` passed
