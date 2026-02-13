# Progress - 2026-02-13 - Heading Hint Visibility Fix

## Issue
- Non-H1/H2 heading left hint (`h3`~`h6`) not visible in editor UI.

## Root Cause
- Global performance rule applied `content-visibility: auto` to `.ProseMirror > *`.
- Heading hint is rendered via `::before` with negative `left`, which got clipped by paint containment from `content-visibility`.

## Fix
- File: `src/lib/styles/editor.css`
- Added targeted override for focused heading nodes with `data-hm-heading-hint`:
  - `content-visibility: visible !important;`
- Scope is limited to focused editor and `h3~h6` with heading hint attribute.

## Validation
- Playwright check on `h6`:
  - `contentVisibility` = `visible`
  - `::before` content exists (`"h6"`)
- Screenshot saved during validation.
