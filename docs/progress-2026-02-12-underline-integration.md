# Progress Report - 2026-02-12 (Underline Integration)

## Scope
- Install and activate underline support for `hybricmark`.

## Changes
- Installed dependency:
  - `@tiptap/extension-underline`
- Updated `src/lib/components/HybricEditor.tsx`:
  - added `import Underline from "@tiptap/extension-underline";`
  - added `Underline` into `extensions` list

## Result
- Context menu item `下划线` is now operational when text is selected.
- Validation:
  - `npm run lint` ✅
  - `npm run build` ✅

