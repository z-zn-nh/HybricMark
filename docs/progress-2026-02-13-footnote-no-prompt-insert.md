# Progress - 2026-02-13 Footnote No-Prompt Insert

## Change
- Removed prompt-based footnote insertion from context menu action.
- `insertFootnote` now inserts with no dialog:
  - reference: `[^N]` at cursor
  - definition: `[^N]: input description here` below current block
- Added automatic footnote key allocation (`N`) by scanning existing footnote tokens.

## Safety
- Scope limited to footnote insertion path only.
- Other menu actions and editor behaviors unchanged.

## Validation
- `npm run lint` ?
- `npm run build` ?
