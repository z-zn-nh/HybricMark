# 2026-02-13 自动化自检修复（注脚与列表）

## 问题清单
1. 注脚定义行在输入描述时存在误触发跳转风险，且回跳按钮与正文间距过大。
2. 注脚语法在“清除选中样式/清除整段样式”下无法被清理为普通文本。
3. 列表使用“清除整段样式”会波及同组层级（三级清除导致整组层级塌缩）。
4. 顶级列表无法通过 Shift+Tab 退回左对齐段落。

## 代码修复
- `src/lib/components/EditorContextMenu.tsx`
  - 新增注脚语法清理逻辑：
    - `[^x]:` -> `[x]:`
    - `[^x]` -> `[x]`
  - 应用于：
    - `清除选中样式`（仅单文本块选区）
    - `清除整段样式`（当前段落）
  - 重构列表清除逻辑：
    - 优先仅对当前项执行 `liftListItem`（task/list），避免整组塌缩
    - 顶级项无法继续 lift 时，执行“仅当前项转段落”的事务替换（保留其他同级结构）

- `src/lib/components/HybricEditor.tsx`
  - 注脚回跳按钮增加：
    - `tabindex="-1"`
    - `mousedown preventDefault`
  - 降低输入过程中焦点误切换与误触发跳转风险。
  - `Shift-Tab` 列表快捷键增加兜底：
    - 无法 lift 时，对当前列表项执行 `clearNodes + unsetAllMarks` 以退出列表到左对齐段落。

- `src/lib/styles/editor.css`
  - 注脚定义行改为 `inline-flex`，压缩布局宽度
  - 收紧回跳按钮左边距，消除过大空白

## 自动化回归（Playwright）
- 场景 A：`Ctrl+Shift+F` 插入注脚 -> 编辑 key -> 编辑描述
  - 结果：光标保持在定义行，不自动跳转。
- 场景 B：选中 `[^9]` 执行 `Ctrl+\`
  - 结果：转换为 `[9]`，可清除注脚样式。
- 场景 C：三级列表执行 `Ctrl+Shift+\`
  - 结果：仅当前项层级变化，其他层级未被整体重置。
- 场景 D：顶级列表执行 `Shift+Tab`
  - 结果：可退出为左对齐段落。

## 构建校验
- `npm run lint` 通过
- `npm run build` 通过
