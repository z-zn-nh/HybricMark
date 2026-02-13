# Progress - 2026-02-13 IME Safety & Cursor Stability

## Scope
- Verified and fixed uncontrolled editor architecture in `src/lib/components/HybricEditor.tsx`.
- Strengthened content-visibility exception rule in `src/lib/styles/editor.css`.

## Changes
1. Uncontrolled initialization
- `HybricEditor` now initializes editor content once via lazy state (`initialContent`).
- Removed render-time `resolvedContent` re-injection into `useEditor`, preventing IME composition resets.

2. Safe external content sync
- Added guarded sync effect:
  - normalizes incoming `content`
  - compares signatures before applying
  - skips updates while editor is focused or composing (`editor.view.composing`)
  - only calls `setContent` when truly different
- Keeps editor stable during Chinese IME composition and avoids transaction loops.

3. IME safety note
- Added explicit code comment in update handler:
  - `// Note: This editor is uncontrolled. Do not force-update 'content' prop on every keystroke to avoid breaking Chinese IME.`

4. Cursor/jitter stability
- Updated selected/focused block exception rule to force visibility:
  - `.ProseMirror > *.is-selected { content-visibility: visible !important; }`
  - implemented through existing selector group with `!important`.

## Validation
- `npm run lint` ?
- `npm run build` ?

## Notes
- Existing editor behavior and feature wiring were preserved; this patch targets only IME/cursor-safety paths.
