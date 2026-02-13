# Progress - 2026-02-13 Footnote Style Polish (No Logic Change)

## Scope
- Style-only polish for footnote rendering based on visual feedback.
- No changes to insertion flow or other editor features.

## Adjustments
- Ref token `[x]` display tightened:
  - removed visual gap artifact (`[ 2]` issue) by making caret-hiding span zero-width
  - normalized superscript line-height/selection style
- Missing-reference color softened to neutral gray (no aggressive red)
- Definition line restyled:
  - switched to inline-flex compact layout
  - token `[x]:` kept compact and non-wrapping
  - back-jump button `?` moved near definition content (not pinned to far right edge)

## Files
- `src/lib/styles/editor.css`

## Validation
- `npm run lint` ?
- `npm run build` ?
