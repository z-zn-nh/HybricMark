# Progress Report - 2026-02-13 (Selection Disable + Cursor Preserve + Top Toast)

## Scope
- Disabled selection-dependent context menu actions when selection is empty.
- Fixed cursor jump-to-line-start after style/structure operations.
- Updated copy success toast style and moved it to top-center.

## Changes
### 1) Selection-dependent menu disable
File: `src/lib/components/EditorContextMenu.tsx`
- First-level actions now disabled when no selection:
  - 加粗 / 斜体 / 链接 / 高亮
- More-format submenu actions now disabled when no selection:
  - 下划线 / 删除线 / 行内代码 / 脚标 / 上标
- Existing logic retained for:
  - 删除选中 / 清除选中样式

### 2) Cursor position preservation
File: `src/lib/components/EditorContextMenu.tsx`
- Removed block-anchor forcing flow for style/structure commands.
- Replaced with reference-position execution helper:
  - `runWithReferenceSelection(...)`
- Heading/List/Math/HorizontalRule actions now execute at right-click reference position instead of jumping to block start.

### 3) Copy toast polish
File: `src/lib/components/EditorContextMenu.tsx`
- Toast moved to top-center (`top: 16px`, `left: 50%`).
- Improved visual style (shadow, spacing, corner radius).

## Verification
- `npm run lint` ?
- `npm run build` ?
