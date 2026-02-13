# Progress - 2026-02-13 Footnote Markdown Syntax Mode

## What changed
1. Footnote source syntax aligned to markdown extension style
- Reference syntax: `[^x]`
- Definition syntax: `[^x]: description`
- `insertFootnote` now inserts raw markdown footnote tokens instead of custom rich-node link markup.

2. Context menu relocation
- Moved `注脚` action into `插入更多` submenu.
- Removed it from `更多格式` submenu.

3. Runtime rendering behavior for editing UX
- Added `FootnoteSyntaxBehavior` ProseMirror plugin in `HybricEditor`:
  - if `[^x]` has a matching `[^x]: ...` definition, reference token is visually rendered as blue superscript `[x]`
  - unresolved reference is styled in red to expose broken mapping
  - definition line gets right-side jump button (`?`) to return to first reference
  - clicking `[x]` jumps to definition; clicking `?` jumps back to reference

4. Styling
- Added footnote-specific classes in `src/lib/styles/editor.css`:
  - `.hm-footnote-ref-token*`
  - `.hm-footnote-definition-line`
  - `.hm-footnote-definition-token`
  - `.hm-footnote-backref-btn`

## Validation
- `npm run lint` ?
- `npm run build` ?
