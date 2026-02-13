# Progress Report - Typora Microtune (Heading + Task Align)

Date: 2026-02-12
Scope: Fine-tune heading rhythm and task-list alignment per visual QA.

## Adjustments

1. H1/H2 underline spacing tightened
- Reduced `padding-bottom` for H1/H2 from loose spacing to closer Typora-like underline proximity.
- Slightly reduced bottom margin for tighter heading-to-body rhythm.

2. Non-H1/H2 micro `Hx` indicators when editor is unfocused
- Added pseudo markers for H3/H4/H5/H6:
  - Rendered on the left side (`::before`)
  - Only visible when editor root is not focused (`.hm-editor-root:not(:focus-within)`)
  - Small muted typographic style for unobtrusive guidance

3. Heading scale increased for H3-H6
- H3/H4/H5 fonts increased.
- H6 now set to `1em` (no longer smaller than paragraph text).

4. Task list checkbox/text alignment fixed
- Task rows now center-align vertically.
- Removed extra top offset on checkbox label.
- Kept completed-item strike style.

## Validation

- `npm run lint`: PASS
- `npm run build`: PASS
- Playwright checks:
  - H1/H2 computed padding-bottom reduced
  - H4 pseudo content visible as `"h4"` when editor unfocused
  - H6 computed font-size = `16px` (same as body in current setup)
  - Task checkbox/text centerline difference = `0px`
