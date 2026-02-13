# Progress - 2026-02-13 Footnote Insert Editable-Key + No Auto-Jump

## Fixed per feedback
1. Insert footnote should be editable in bracket key
- `insertFootnote` now inserts `[^N]: ` and selects `N` directly.
- User can type bracket key immediately without prompt.

2. Insert placement rule
- If current paragraph is empty: insert in current line.
- If current paragraph has content: create a new line below and insert there.

3. No hardcoded body text
- Removed real text insertion (`input description here`) from document model.
- Placeholder remains visual-only via decoration widget.

4. Back-jump button behavior
- Back-jump button is rendered for definition lines.
- If no reference exists yet, button is shown in disabled style and does not jump.

5. Typing stability after `[^x]:`
- Definition line stays in editable mode while cursor is anywhere on that line.
- Avoids premature source-hide behavior that blocked normal typing after colon.

## Files
- `src/lib/components/EditorContextMenu.tsx`
- `src/lib/components/HybricEditor.tsx`
- `src/lib/styles/editor.css`

## Validation
- `npm run lint` ?
- `npm run build` ?
