# Progress - 2026-02-13 Footnote Insert Logic + Typora-like Editing Fix

## External reference check
- Verified Typora footnote syntax model is markdown extension style:
  - reference: `[^x]`
  - definition: `[^x]: content`
- Source reference used: Typora markdown reference pages.

## Fixes implemented
1. Insert behavior (no prompt, no side effects)
- `insertFootnote` now follows requested behavior:
  - if current paragraph is empty: fill current paragraph with `[^N]: `
  - if current paragraph has content: create a new paragraph below and insert `[^N]: `
- no default content text is inserted anymore (placeholder is visual only).

2. Placeholder is visual hint (not actual text)
- Added decoration widget placeholder `input description here` only when definition has no content.
- Typing content after `[^x]:` removes placeholder naturally.

3. Manual typing stability (`[^x]:`)
- Footnote token rendering switched to source-hidden + stable widget display in non-edit mode.
- Cursor inside token shows raw source (editable), outside token shows normalized visual token.
- Prevents malformed token artifacts and keeps input editable after `:`.

4. Jump behavior
- Kept clickable `[x]` reference -> jump to definition.
- Kept `?` button on definition line (only shown when corresponding reference exists).

## Files
- `src/lib/components/EditorContextMenu.tsx`
- `src/lib/components/HybricEditor.tsx`
- `src/lib/styles/editor.css`

## Validation
- `npm run lint` ?
- `npm run build` ?
