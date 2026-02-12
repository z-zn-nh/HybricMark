# Progress Report - TaskList/Link/Heading Hotfix

Date: 2026-02-12
Scope: Fix regression where task list rendering broke after HTML/footnote integration, restore link jump behavior, and align heading visual rhythm with Typora style.

## Fixed

1. Task list rendering restored (`src/lib/components/HybricEditor.tsx`)
- Added `markdown-it-task-lists` plugin in markdown preprocessing pipeline.
- Implemented robust task-list HTML normalization:
  - Convert markdown-it task `<li>` to Tiptap-compatible `taskItem` structure.
  - Remove nested checkbox artifacts inside paragraph content.
  - Split mixed `<ul>` blocks into separate normal-list and task-list segments.
- Result: `taskList/taskItem` nodes now parse correctly with text content and checkbox state preserved.

2. Link jump behavior fixed (`src/lib/components/HybricEditor.tsx`)
- Unified click handling in `editorProps.handleClick`:
  - External links always open in new tab.
  - Hash links (`#fn1`) perform in-page smooth scroll.
- Verified by Playwright tab switch on `https://tiptap.dev`.

3. Typora-like heading tuning (`src/lib/styles/editor.css`)
- Re-tuned heading spacing/border rhythm:
  - H1/H2 use subtle bottom border `#eaecef`
  - Consistent vertical spacing and line-height pattern for H1-H6
- Matches Typora/GitHub-like heading cadence more closely.

4. HTML block safety refinement (`src/lib/extensions/HtmlBlock.ts`)
- Updated parser guard to ignore task-item internal container `div`, preventing task content capture collisions.

## Validation

- `npm run lint`: PASS
- `npm run build`: PASS
- Playwright assertions:
  - `li[data-checked]` count = 2
  - task item texts = `Task item pending`, `Task item done`
  - link click opens target tab (`https://tiptap.dev`)
  - H1/H2 computed border and spacing values reflect expected Typora style cadence
