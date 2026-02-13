# HybricMark Progress - 2026-02-12 (Phase 2: Hybrid Link)

## Goal

Implement "Source-on-Focus" behavior for links using a custom inline node + React NodeView.

## Completed

1. Updated `src/lib/extensions/HybridLink.tsx`
- Kept custom inline node architecture (`hybridLink`) with `ReactNodeViewRenderer`.
- Implemented focus/blur hybrid rendering:
  - Blur: render standard `<a>` preview (`hm-text-blue-600 hm-underline`).
  - Focus (node selected in editable mode): render source container + source editor:
    - container classes include `hm-font-mono hm-bg-gray-100 hm-rounded hm-px-1`
    - source format: `[label](url)`
- Source input handler updates node attributes on blur/enter.

2. Added paste-to-link conversion in `HybridLink`
- Added ProseMirror paste plugin (`hybridLinkPaste`).
- Behavior:
  - if pasted plain text is URL (`http/https`)
  - and user has selected text
  - replace selection with `hybridLink` node where:
    - `href = pasted URL`
    - `text = selected text`
  - if no selection, insert URL as both label and href.

3. Editor integration check
- `src/lib/components/HybricEditor.tsx` already disables default StarterKit link and includes `HybridLink`, no further change required.

## Validation

- `npm run lint` ✅
- `npm run build` ✅

## Patch: Non-Protocol URL Support

- Fixed markdown input conversion for cases like `[baidu](www.baidu.com)`.
- Input rule now accepts URL text without protocol and normalizes to `https://...`.
- Paste handler also accepts non-protocol domain URLs and normalizes href.

## Patch: Stabilized Conversion Path

- Removed `nodeInputRule` for markdown-link conversion to avoid double-transform conflicts.
- Switched to a single deterministic conversion flow in ProseMirror plugin:
  - convert on `)` typing (immediate)
  - convert on `Enter` / `Space` / `Tab` (fallback)
- Added clipboard HTML parsing for `<a href>` extraction before plain-text fallback.
- Added stricter URL validation in source-mode commit to prevent malformed nested href/text corruption.
