# HybricMark Progress - 2026-02-12 (Phase 4: Business Logic Integration)

## Goal

Expose editor internal block identity to external business logic through `onExtract`.

## Implemented

1. Updated `HybricEditorProps` in `src/lib/components/HybricEditor.tsx`
- Replaced context-menu callback prop with:
  - `onExtract?: (data: { id: string; content: JSONContent; text: string }) => void`
- Wired prop to context menu component:
  - `<EditorContextMenu editor={editor} onExtract={onExtract}>...`

2. Updated extraction flow in `src/lib/components/EditorContextMenu.tsx`
- Added `ExtractPayload` type:
  - `id: string`
  - `content: JSONContent`
  - `text: string`
- `Extract to Card` now resolves block at click/selection time by:
  - Using current selection anchor (or fallback context position)
  - Traversing ancestor nodes to find nearest block with valid `id`
- Fires `onExtract(payload)` with:
  - stable block `id`
  - full block JSON
  - plain text (`node.textContent`)

3. Updated exports in `src/lib/index.ts`
- Exported `ExtractPayload` (renamed from previous payload type).

## Notes

- Slash command is optional in this phase and not added yet to keep this commit focused on extraction business logic path.

## Validation

- `npm run lint` ✅
- `npm run build` ✅

