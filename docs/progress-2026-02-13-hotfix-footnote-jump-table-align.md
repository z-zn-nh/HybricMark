# 2026-02-13 定点修复（注脚回跳 + 表格左对齐）

## 目标
仅修复两项：
1. 注脚回跳按钮点击无跳转
2. 表格顶栏左对齐按钮失效

## 变更
- `src/lib/components/HybricEditor.tsx`
  - 注脚点击处理统一到 `handleFootnoteClick`，同时挂在：
    - `props.handleClick`
    - `props.handleDOMEvents.click`
  - 恢复注脚回跳按钮点击跳转（只按 `hasRef` 决定可跳）。
  - 表格扩展改为 `TyporaTable`（含 `align` 属性，渲染 `data-align`）。
  - 顶栏对齐按钮改为更新 table 节点对齐属性；并增加 DOM 兜底写入 `data-align`，确保左/中/右即时生效。

## 自动化验证（Playwright）
- 点击注脚回跳按钮：光标成功跳转到引用段落（`ref [^a]`）。
- 表格按钮测试：
  - 点击右对齐后 `data-align = "right"`
  - 点击左对齐后 `data-align = "left"`
- 控制台 error：无。

## 构建验证
- `npm run lint` 通过
- `npm run build` 通过
