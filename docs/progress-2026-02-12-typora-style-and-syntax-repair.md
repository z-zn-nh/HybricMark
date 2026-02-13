# Progress Report - Typora Style & Syntax Repair

Date: 2026-02-12
Scope: Editor syntax/styling parity fixes and context menu behavior correction.

## Completed

1. Extension layer updates in `src/lib/components/HybricEditor.tsx`
- Added `Link` extension as explicit extension (StarterKit link disabled) with:
  - `openOnClick: true`
  - `autolink: true`
  - `linkOnPaste: true`
- Added `Typography` extension.
- Added `Markdown` extension with GFM-oriented marked options.
- Added `Mathematics` with `throwOnError: false` and on-create migration (`migrateMathStrings`) for `$...$` conversion.
- Kept and expanded `UniqueID` target types:
  - `heading`, `paragraph`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`
- Kept custom keyboard behavior:
  - `Mod-Enter` exits `codeBlock`
  - `Enter` exits inline `code` mark path

2. Context menu fixes in `src/lib/components/EditorContextMenu.tsx`
- Added formatting actions:
  - highlight, subscript, superscript, task list toggle
- Fixed severe clear-format issue:
  - changed from `unsetAllMarks().clearNodes()` to selection-safe `unsetAllMarks()` only
- Insert actions now execute typed commands directly:
  - table via `insertTable({ rows: 3, cols: 3, withHeaderRow: true })`
  - image via `setImage({ src, alt })`
  - math block via `insertBlockMath({ latex })`

3. Typora-like stylesheet expansion in `src/lib/styles/editor.css`
- Distinct h4/h5/h6 scale and tone.
- Added mark styles:
  - `strong`, `em`, `u`, `s`, `mark`, `sub`, `sup`
- Nested list marker hierarchy improved (`disc/circle/square`, ordered lower-alpha/roman).
- Task list visual system added for `taskList/taskItem` including checkbox behavior style and completed strike-through.
- Table wrapper + table cell visuals refined.
- Mathematics node visuals added for inline and block containers.
- Link pointer style improved.

4. Library style export
- `src/lib/index.ts` now imports `katex/dist/katex.min.css` for formula rendering.

5. Playground sample verification content
- `src/playground/App.tsx` now uses markdown source directly (no manual html transformer).
- Sample includes headings (1-6), nested lists, task list, marks, link, table, inline math, footnote text, html snippet text.

## Validation

- `npm run lint`: PASS
- `npm run build`: PASS
- Playwright snapshot confirms:
  - context menu no longer vertical/broken layout
  - h4/h5/h6 visible differentiation
  - highlight/sub/sup styles rendered
  - task list rendered and interactive
  - table rendered as table node
  - inline math rendered with KaTeX

## Remaining Known Gaps

- Footnote syntax is still plain text (requires dedicated footnote extension/plugin support).
- Raw HTML markdown fragment currently normalizes to plain paragraph in current extension stack.
- Link "jump" behavior in editable mode is intentionally constrained by editor interaction model; open-on-click is enabled but may still require modifier / selection context depending on browser/editor focus behavior.

## Next Planned Fixes

1. Add dedicated footnote support (custom extension or markdown tokenizer bridge).
2. Add explicit HTML block handling strategy (safe parse + node mapping).
3. Add deterministic link-open gesture in edit mode (e.g. Ctrl/Cmd+Click hook).
4. Final pass on code-block enter/exit UX with additional edge-case tests.
