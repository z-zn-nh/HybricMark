# Progress - 2026-02-13 - Table Header Left Align Self-check

## User issue
- "顶格左对齐"在表头单元格上看起来失效。

## Automated diagnosis (Playwright)
1. Clicked table header cell and used toolbar align center/left.
2. Observed DOM/computed styles:
- Center click sets `th` style to `text-align: center;`.
- Left click clears inline style, but computed alignment remained centered before fix in some cases due header default styling path.
3. Root cause: CSS only styled `thead th`, but Tiptap table header cells are `th` inside `tbody` by default.

## Fix
- File: `src/lib/styles/editor.css`
- Added `text-align: left` directly in common `th/td` rule.
- Changed header background/font rule selector from `thead th` to plain `th`.

## Verification
- Re-tested with Playwright:
- `th` center -> left transitions now work.
- After left click, computed style is `left`.

## Notes
- No dependency issue found.
- Problem was CSS selector mismatch with Tiptap table DOM structure.
