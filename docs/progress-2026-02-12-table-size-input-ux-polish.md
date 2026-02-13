# Progress - 2026-02-12 (Table Size Input UX Polish)

## Changes
- Updated table toolbar positioning to sit closer to table top edge.
- Reworked table-size popover to use one combined input (`rows x cols`), e.g. `3x4`.
- Removed numeric spinner-style inputs and switched to plain text input for size entry.
- Fixed focus/typing issue in size popover by allowing normal input focus (no forced mousedown prevent on popover).
- Updated context-menu table creation prompt to a single combined size input (`rows x cols`) instead of two separate prompts.

## Validation
- `npm run lint` passed.
- `npm run build` passed.
- Playwright checks:
  - table-size input accepts `4x5` and applies table dimensions
  - context menu "插入表格" triggers one prompt with combined size format
