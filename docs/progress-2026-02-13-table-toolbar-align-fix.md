# 2026-02-13 表格工具条对齐修复

## 问题
表格工具条中除“调整行列”外，对齐按钮无效。

## 修复
- 文件：`src/lib/components/HybricEditor.tsx`
- `applyTableAlign` 调整为同时更新：
  1. `table` 节点 `align` 属性（`data-align`）
  2. 当前表格内所有 `tableHeader/tableCell` 的 `textAlign` 属性
- 保留 DOM 兜底：写入 table 的 `data-align`，确保 UI 即时反馈。

## 自动化验证
- 点“居中”：`data-align=center`，`th/td style=text-align:center;`
- 点“左对齐”：`data-align=left`，`th/td style` 清除为默认左对齐
- 点“右对齐”：`data-align=right`，`th/td style=text-align:right;`
- 控制台 error：无

## 构建
- `npm run lint` 通过
- `npm run build` 通过
