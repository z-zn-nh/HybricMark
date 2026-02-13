# 2026-02-12 Markdown Paste Hotfix

## Summary
- Added Markdown-aware paste handling in `src/lib/components/HybricEditor.tsx`.
- When pasted plain text looks like Markdown, the editor now parses it through `markdown-it` + existing normalization pipeline before insertion.

## Covered Syntax On Paste
- Headings (`# ..`)
- Lists / task lists (`- [ ]`, `- [x]`)
- Tables (`| col |`)
- Links / images
- Footnote refs and definitions (`[^1]`, `[^1]: ...`)
- Inline markups like highlight/code/sub/sup/math delimiters

## Notes
- This behavior is paste-time parsing. Existing plain text already in the document will not auto-convert retroactively.
- For previously pasted raw text, re-paste the source block to get structured rendering.
