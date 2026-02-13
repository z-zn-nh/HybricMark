# 2026-02-12 Table Typora Revamp

## Scope
- Kept existing editor logic intact; only table-related extension config, context menu table actions, and table styles were updated.

## Changes
1. Switched table setup from TableKit to explicit table extensions:
   - `@tiptap/extension-table`
   - `@tiptap/extension-table-row`
   - `@tiptap/extension-table-header`
   - `@tiptap/extension-table-cell`

2. Enabled resize behavior:
   - `resizable: true`
   - `lastColumnResizable: false`

3. Added table-aware context menu actions when right-click is inside table:
   - Insert Column Left / Right
   - Delete Column
   - Insert Row Above / Below
   - Delete Row
   - Merge Cells
   - Delete Table

4. Updated Typora/GitHub-like table styling:
   - fixed layout table
   - border/padding/line-height tuned
   - header background and alignment
   - zebra rows
   - selected cell and resize handle styles

## Verification
- `npm run lint` passed
- `npm run build` passed
