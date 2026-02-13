# Progress Report - 2026-02-13 (Context Menu Common First-Level + Image Picker)

## Scope
- Reworked normal context menu to keep common actions at first level.
- Updated insertion logic for quote/code block to insert below current block.
- Replaced image URL prompt with native file picker flow.
- Added copy success feedback toast.

## Changes
### 1) 一级菜单改造（按产品要求）
File: `src/lib/components/EditorContextMenu.tsx`
- 一级菜单现为：
  - 加粗
  - 斜体
  - 链接
  - 高亮
  - 代码块
  - 引用
  - 插入表格
  - 插入图像
  - 复制
  - 粘贴
  - 删除选中
  - 删除整段
  - 清除选中样式
  - 清除整段样式
- 二级菜单仅保留“剩余语法/结构”相关：
  - 更多格式
  - 标题
  - 列表
  - 插入更多

### 2) 行为逻辑
File: `src/lib/components/EditorContextMenu.tsx`
- `代码块` / `引用` 改为“在当前段落下方插入新块”，不再对当前块做 toggle。
- 移除 `参考文献` 菜单项（避免重复与歧义）。
- `插入图像` 改为自动打开系统文件选择器，读取本地图片后插入（base64）。
- `复制` 成功后显示轻量 toast：`复制成功`。

## Verification
- `npm run lint` ?
- `npm run build` ?

## Notes
- 未改动表格专用右键分支逻辑。
- 本次只聚焦菜单层级与你提出的交互逻辑修正。
