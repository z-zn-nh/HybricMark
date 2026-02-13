# 2026-02-12 Typora Table Toolbar Follow-cell Tuning

## Requested tuning
- Remove right-side toolbar buttons to reduce visual blocking.
- Keep only left controls.
- Position toolbar by current active table cell (not whole table).
- Fix missing behavior for toolbar actions.

## Implemented
- Toolbar now contains only 4 buttons: header toggle + left/center/right alignment.
- Toolbar position is anchored to active `tableCell` / `tableHeader` rect.
- Added table cell/header `textAlign` attribute support via extension overrides.
- Alignment buttons now execute `setCellAttribute('textAlign', ...)` and render real inline style.
- Kept independent table context menu for advanced operations.

## Verification
- `npm run lint` passed
- `npm run build` passed
