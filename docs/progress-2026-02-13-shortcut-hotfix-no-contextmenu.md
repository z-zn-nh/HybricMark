# Progress Report - 2026-02-13 (Shortcut Hotfix: No-ContextMenu Trigger)

## Issue
- User reported shortcuts did not trigger when using keyboard directly (without opening context menu).

## Fix
File: `src/lib/components/EditorContextMenu.tsx`

1) Focus detection hardening
- Previously required `editor.isFocused` only.
- Now accepts either:
  - `editor.isFocused === true`, or
  - `document.activeElement` is inside `editor.view.dom`.

2) Event phase hardening
- Keyboard listener moved to capture phase:
  - `document.addEventListener('keydown', handler, true)`
- This ensures shortcut handling still works even when some inner handlers stop propagation.

3) Mark shortcut usability
- Removed selection-required guard for common format shortcuts:
  - `Mod+B`, `Mod+I`, `Mod+K`, `Mod+Shift+H`, `Mod+U`, `Mod+Shift+X`, `Mod+E`, `Mod+,`, `Mod+.`
- They now work with empty selection as editor stored marks / mark commands.

## Verification
- `npm run lint` ?
- `npm run build` ?
