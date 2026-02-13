# Progress - 2026-02-13 - Table Popup & Link Edit UX Upgrade

## Scope
- Table size UI in table toolbar tooltip.
- Link editing flow in context menu and keyboard.
- Hover link preview and toast style polish.

## Changes
1. `src/lib/components/HybricEditor.tsx`
- Table size popover changed from `NxN` single input to two fields:
  - `列数：`
  - `行数：`
- Added strict numeric parsing per field and kept existing apply logic.
- Added link hover tooltip (`500ms`) for anchor preview.

2. `src/lib/components/EditorContextMenu.tsx`
- Removed `window.prompt` for link and insert-table actions.
- Added custom in-app dialogs (portal):
  - Link edit dialog with prefill + auto select all.
  - Insert table dialog with `列数` + `行数`.
- Right-click on existing link now pre-fills current href.
- Added `Ctrl++` (and `Mod+K`) to open link editor.
- Refined top toast style for copy success.

3. `src/lib/styles/editor.css`
- Styled table size popover to match library visual language.
- Added styles for:
  - `.hm-link-hover-tooltip`
  - `.hm-editor-dialog-*`

## Automated self-check (Playwright)
- Table toolbar popover shows labels `列数：` and `行数：`.
- Link hover > 500ms shows tooltip with href.
- Right-click link -> Link action opens dialog with href prefilled and full selected text.
- `Ctrl++` opens link editor dialog.
- Console errors: none.

## Build/quality
- `npm run lint` passed.
- `npm run build` passed.
