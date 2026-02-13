# HybricMark Progress - 2026-02-12 (Phase 3: Interaction System)

## Goal

Implement a global context menu for editor interactions, aligned with `docs/rules.md` context-first UX.

## Implemented

1. Created `src/lib/components/EditorContextMenu.tsx`
- Built with `@radix-ui/react-context-menu`.
- Wraps editor content via `ContextMenu.Trigger`.
- Detects right-click context with:
  - `editor.view.posAtCoords` for clicked block position
  - `editor.state.selection` for selection-vs-block scenario
- Context scenarios:
  - Selection scenario:
    - Bold
    - Italic
    - Strike
    - Extract to Card
  - Block scenario:
    - Copy Block ID
    - Delete Block
    - Turn Into... (Heading 1, Heading 2, Bullet List)
- Added `lucide-react` icons on all actions.
- Styled menu with required utility classes:
  - `hm-bg-white`
  - `hm-shadow-lg`
  - `hm-border`
  - `hm-rounded-md`

2. Updated `src/lib/components/HybricEditor.tsx`
- Integrated `EditorContextMenu` around `EditorContent`.
- Added optional prop `onExtractToCard` and passed through to context menu.

3. Updated `src/lib/index.ts`
- Exported:
  - `EditorContextMenu`
  - `EditorContextMenuProps`
  - `ExtractToCardPayload`

## Validation

- `npm run lint` ✅
- `npm run build` ✅

