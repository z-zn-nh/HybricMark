# Progress - 2026-02-13 Footnote Insert Behavior + Spacing Fix

## Requested fixes
1. Remove left-side spacing artifact in `[x]` display.
2. Footnote is an insert action: do not add extra bottom reference token on click.

## Applied changes
- `src/lib/components/EditorContextMenu.tsx`
  - `insertFootnote` now inserts only the definition line below current block:
    - `[^N]: input description here`
  - Removed inline reference insertion (`[^N]`) at cursor, so the blue bottom token won't appear from this action.

- `src/lib/styles/editor.css`
  - `p.hm-footnote-definition-line` changed from `inline-flex` to `flex` to avoid same-line chaining artifacts.
  - `.hm-footnote-caret-hidden` changed to `display: none` to fully remove `^` width and fix `[ x]` spacing issue.

## Validation
- `npm run lint` ?
- `npm run build` ?
