# Progress - 2026-02-13 (Unified Context Menu + Nested Submenus)

## Refactor
- Rebuilt `EditorContextMenu.tsx` with a single non-table menu for both selected and non-selected states.
- Kept independent table context menu mode.

## Menu Architecture
- Added second-level submenus using Radix `ContextMenu.Sub`:
  - `格式`
  - `块样式` (with nested `标题`, `列表`)
  - `插入`
  - `操作`

## Functional Updates
- Added `引用` action.
- Removed `摘录到卡片` and `复制块 ID` from non-table menu.
- Added operations:
  - 删除选中
  - 复制
  - 粘贴
  - 清除段落格式
- Kept previously added insert actions:
  - 参考文献
  - 代码块
  - 数学公式
  - 插入表格/图片
  - 分割线
  - 段落上面/段落下面
- Added `注脚` under formatting.

## Bug Fix (List Context)
- Introduced block-anchor selection resolver (`resolveBlockAnchorPos`) to anchor actions to the nearest textblock inside the current block/list context.
- `引用` and `代码块` now run through this resolver and include fallback commands (`setBlockquote`, `setCodeBlock`) when toggle fails.

## Validation
- `npm run lint` passed.
- `npm run build` passed.
