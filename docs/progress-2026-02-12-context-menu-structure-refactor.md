# Progress - 2026-02-12 (Context Menu Structure Refactor)

## Changes Completed
- Refactored non-table context menu structure and actions.

### Selection Mode
- Kept formatting: bold/italic/underline/strike/inline-code/highlight.
- Renamed subscript label to `脚标`.
- Added `注脚` action (inserts footnote marker + definition template).
- Removed `摘录到卡片`.
- Added actions under link/actions group:
  - 删除选中
  - 复制（selection）
  - 粘贴（clipboard -> insert)

### Block Mode
- Removed `正文` item.
- Expanded headings to full set:
  - 一级标题 ~ 六级标题
- Moved `参考文献` / `代码块` / `数学公式` into `插入` group.
- Added insert actions:
  - 分割线
  - 段落上面
  - 段落下面
- Updated operation group:
  - Removed `复制块 ID`
  - Added `删除选中`
  - Added `复制`
  - Added `粘贴`
  - Added `清除段落格式`

## Implementation Notes
- Added clipboard helpers for copy/paste with browser permission fallback prompt.
- Added paragraph insertion logic above/below active block.
- Added clear paragraph format by selecting active block and running clear nodes + unset marks.

## Validation
- `npm run lint` passed.
- `npm run build` passed.
- Playwright spot check confirms new menu entries appear in both selection and block modes.
