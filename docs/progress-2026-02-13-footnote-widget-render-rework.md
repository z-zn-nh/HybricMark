# Progress - 2026-02-13 Footnote Render Rework (Widget-based)

## Why
- Previous caret-hiding approach could still show malformed token visuals in some cursor states.

## What changed
- Reworked footnote token rendering in `src/lib/components/HybricEditor.tsx`:
  - For non-editing state, hide raw source token (`[^x]` / `[^x]:`) entirely.
  - Render stable visual widgets instead:
    - reference widget: `[x]`
    - definition token widget: `[x]:`
  - Keep raw token visible only when cursor is inside the token (`hm-footnote-token-editing`).
- Fixed back-jump button text and aria label to proper Chinese/arrow.
- Updated styles in `src/lib/styles/editor.css`:
  - added `.hm-footnote-source-hidden`
  - tuned `.hm-footnote-ref-token` / `.hm-footnote-token-editing` for stable alignment.

## Safety
- Changes are isolated to footnote rendering path.
- Other editor features unchanged.

## Validation
- `npm run lint` ?
- `npm run build` ?
