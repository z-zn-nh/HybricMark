# Progress - 2026-02-13 Footnote Jump Trigger Safety

## Change
- Prevent accidental jump while editing footnote syntax.
- In footnote plugin click handler:
  - reference token `[x]` jumps only on `Ctrl/Cmd + Click`
  - plain click does not trigger jump (cursor/editing safe)
  - backref button behavior unchanged (explicit click action)

## File
- `src/lib/components/HybricEditor.tsx`

## Validation
- `npm run lint` ?
- `npm run build` ?
