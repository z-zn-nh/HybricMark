# Progress - 2026-02-13 Footnote Menu + Markdown-Compatible Rendering

## Summary
Implemented footnote UX per requested model while keeping markdown-compatible source syntax.

## Changes
1. Menu placement
- Moved `注脚` action to `插入更多` submenu.
- Removed `注脚` from `更多格式` submenu.

2. Insert behavior
- `insertFootnote` now writes markdown-style source:
  - reference: `[^x]` (insert at cursor)
  - definition: `[^x]: description` (insert below current block)

3. Footnote rendering/jump behavior
- Added `FootnoteSyntaxBehavior` plugin in `HybricEditor`:
  - `[^x]` reference with matching definition is visually rendered as blue superscript `[x]`
  - missing definition is marked in red
  - definition line gets right-side back-jump button `?`
  - click reference => jump to definition
  - click `?` => jump back to first reference

4. Visual tweak for definition token
- Source token stays `[^x]:` internally.
- Display layer renders token as `[x]:` (caret hidden visually), matching requested style.
- Editing within token temporarily shows raw source for safe editing.

## Validation
- `npm run lint` ?
- `npm run build` ?
