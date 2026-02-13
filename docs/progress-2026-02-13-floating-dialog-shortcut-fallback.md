# Progress - 2026-02-13 - Floating Dialog + Link Shortcut Fallback

## Scope
- Improve link/table dialog UX to avoid center overlay blocking editor content.
- Resolve browser zoom conflict for `Ctrl++` link shortcut usage.

## Changes
1. `src/lib/components/EditorContextMenu.tsx`
- Context menu state now stores pointer coordinates (`clientX`, `clientY`).
- Added floating dialog position calculator with viewport clamping.
- Link dialog and table dialog changed from centered overlay modal to floating non-modal panel near trigger point.
- Added outside-click close behavior via document capture listener.
- Link shortcut updated:
  - Kept `Ctrl/Cmd + +` best-effort handling.
  - Added reliable fallback `Ctrl/Cmd + Shift + K`.
- Shortcut label updated to `Mod+K / Mod+Shift+K`.

2. `src/lib/styles/editor.css`
- Reworked dialog styles to Typora-like compact panel style:
  - Rectangular corner, thin border, subtle shadow.
  - Smaller controls and neutral visual weight.
- Removed full-screen overlay usage.

## Automated self-check (Playwright)
- `Ctrl+Shift+K` opens link panel successfully.
- `Ctrl+Alt+T` opens table panel with labels `列数：` and `行数：`.
- Panels are floating at pointer/caret vicinity, not centered modal.
- Console errors: none.

## Build
- `npm run lint` passed.
- `npm run build` passed.
