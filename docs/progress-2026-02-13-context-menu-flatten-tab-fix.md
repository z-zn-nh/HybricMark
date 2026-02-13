# Progress Report - 2026-02-13 (Context Menu Flatten + List Tab Fix)

## Scope
- Flattened normal-mode context menu to avoid deep nesting.
- Kept table context menu isolated (no change to table-only branch).
- Fixed duplicate insertion entry.
- Improved list Tab/Shift+Tab behavior reliability.

## Changes
### 1) Context menu hierarchy updates
- File: `src/lib/components/EditorContextMenu.tsx`
- Reworked normal menu to include common first-level actions:
  - 加粗
  - 斜体
  - 链接
  - 引用
  - 代码块
  - 插入表格
  - 粘贴
- Kept only second-level submenus (removed third-level nesting):
  - 格式
  - 标题
  - 列表
  - 插入更多
  - 操作
- Removed duplicated `参考文献` menu entry.

### 2) List indentation behavior
- File: `src/lib/components/HybricEditor.tsx`
- Updated `KeyboardBehavior` Tab handlers to use command capability checks:
  - `can().sinkListItem('taskItem'/'listItem')`
  - `can().liftListItem('taskItem'/'listItem')`
- This improves hit rate when selection context is inside nested list structures.

## Verification
- `npm run lint` ?
- `npm run build` ?

## Notes
- Working tree contains many pre-existing modified/untracked files not touched by this patch.
- This patch only targets menu depth/duplication and list Tab behavior.
