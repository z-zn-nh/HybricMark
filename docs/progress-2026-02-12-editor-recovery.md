# Progress Report - 2026-02-12 (Editor Recovery)

## Context
- User reported: Markdown syntax appears broken and visual styles do not apply.
- Scope: `HybricEditor`, context menu integration, Tailwind style pipeline, local dev runtime.

## Root Causes
1. Tailwind stylesheet was not loaded in app runtime.
   - `src/index.css` still contained default Vite CSS instead of Tailwind import.
   - Result: all `hm-*` utility classes were effectively no-op.

2. Duplicate `link` extension registration in Tiptap config.
   - `StarterKit` already includes `link`, while `@tiptap/extension-link` was also added manually.
   - Result: runtime warning and unstable behavior risk.

3. App-level callback type mismatch.
   - `HybricEditor.onChange` now returns `Editor`, while `src/App.tsx` treated it like plain JSON.
   - Result: runtime rendering risk when serializing unexpected object.

4. Multiple Vite dev processes were running on port `5173`.
   - Result: stale HMR stream, inconsistent runtime behavior and hard-to-reproduce errors.

## Fixes Applied
- Updated `src/lib/components/HybricEditor.tsx`:
  - Removed explicit `Link` extension import/registration.
  - Configured link behavior inside `StarterKit.configure({ link: { openOnClick: false, autolink: true } })`.

- Replaced `src/index.css`:
  - Added `@import "tailwindcss";`
  - Added minimal global baseline styles.

- Updated `src/lib/styles/editor.css`:
  - Added explicit fallback styles for links and headings in editor content.

- Updated `src/App.tsx`:
  - `onChange` now consumes `Editor` and stores `editor.getJSON()` safely.

- Updated `src/playground/main.tsx`:
  - Imports `../index.css` so Tailwind utilities are available in playground entry.

## Validation
- `npm run lint`: pass
- `npm run build`: pass
- Playwright runtime check on `http://127.0.0.1:5173`:
  - Editor and DevTools panel render correctly.
  - No runtime error logs.
  - No duplicate link extension warning.

