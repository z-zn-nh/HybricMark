# Progress Report - 2026-02-13 (Shortcut System + Menu Accelerator Display)

## Scope
- Added a keyboard shortcut system bound to the same context-menu actions.
- Displayed standard shortcut labels on the right side of menu items.
- Kept existing interaction logic and selection guards.

## Changes
### 1) Shortcut display in context menu
Files:
- `src/lib/components/EditorContextMenu.tsx`
- `src/lib/styles/editor.css`

Details:
- Added shortcut formatter with platform-aware rendering:
  - macOS: `?`, `?`, `?`
  - Windows/Linux: `Ctrl+`, `Alt+`, `Shift+`
- Added right-side accelerator labels for primary and submenu items.
- Added `.hm-context-menu-shortcut` style for compact monospace key hints.

### 2) Keyboard shortcut bindings
File:
- `src/lib/components/EditorContextMenu.tsx`

Details:
- Added document-level keydown listener while editor is focused.
- Shortcuts trigger the same command handlers as right-click menu items.
- Selection-sensitive actions are guarded and ignored when selection is empty.

Implemented combos (core set):
- `Mod+B` 加粗
- `Mod+I` 斜体
- `Mod+K` 链接
- `Mod+Shift+H` 高亮
- `Mod+Alt+C` 代码块（下插）
- `Mod+Shift+.` 引用（下插）
- `Mod+Alt+T` 插入表格
- `Mod+Alt+I` 插入图像
- `Mod+C` 复制
- `Mod+V` 粘贴
- `Backspace` 删除选中
- `Mod+Shift+Backspace` 删除整段
- `Mod+\\` 清除选中样式
- `Mod+Shift+\\` 清除整段样式
- plus heading/list/insert-more combos shown in submenu

### 3) Cursor-stability follow-up
- Kept reference-position execution for heading/list/insert-more actions to avoid cursor jumping to line start after formatting.

## Verification
- `npm run lint` ?
- `npm run build` ?
