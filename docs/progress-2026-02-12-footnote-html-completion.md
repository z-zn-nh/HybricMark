# Progress Report - Footnote & HTML Completion

Date: 2026-02-12
Scope: Complete remaining syntax gaps (footnotes + HTML tag support) and finalize Typora-style behavior consistency.

## Completed

1. Markdown preprocessing pipeline in `src/lib/components/HybricEditor.tsx`
- Added `markdown-it` parsing pipeline for string content:
  - `html: true` (raw HTML tags enabled)
  - `linkify: true`
  - `typographer: true`
- Added plugins:
  - `markdown-it-footnote`
  - `markdown-it-mark`
  - `markdown-it-sub`
  - `markdown-it-sup`
- String content now flows as:
  - markdown string -> html string (parser render)
  - html string -> editor content
- Non-string JSON content path remains unchanged.

2. Footnote rendering support
- Footnote references (`[^1]`) and definitions are now converted and rendered.
- Back-reference links are preserved.
- Added footnote styles in `src/lib/styles/editor.css`:
  - reference superscript appearance
  - backref link style
  - footnotes section/list visual treatment

3. HTML block support
- Added custom extension `src/lib/extensions/HtmlBlock.ts`.
- Parses block-level `<div>...</div>` into a dedicated block node (`htmlBlock`) with class `hm-html-block`.
- Prevents fallback degradation of raw HTML blocks into plain paragraph text.

4. Link interaction consistency
- Link extension now keeps `openOnClick: false` to avoid edit disruption.
- Added deterministic open behavior in `editorProps.handleClick`:
  - Ctrl/Cmd + click opens link in new tab.
  - readonly mode click also opens link.

5. Playground verification content updated
- Added explicit footnote reference line to ensure both ref/definition are testable.

## Validation

- `npm run lint`: PASS
- `npm run build`: PASS
- Playwright runtime checks confirm:
  - `a[href="#fn1"]` exists (footnote ref)
  - `a.footnote-backref` exists (footnote backref)
  - HTML block rendered as actual `DIV.hm-html-block`
  - No console errors in latest run

## Notes

- This completion targets rendering + editing integration in current architecture.
- Additional future enhancement can include richer HTML schema mappings beyond `<div>` (e.g. `<figure>`, `<details>`, semantic custom blocks).
