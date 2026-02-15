# Progress - 2026-02-15 - Language Toggle UX Clarification

## Problem
User expected language toggle behavior as: click button to switch current docs body from English to Chinese.
There was confusion because the button showed current language state (`EN`/`中文`) rather than target language.

## Changes
- Updated `www/components/site/TopRightControls.tsx`:
  - Language button now displays target language instead of current language.
  - In English mode it shows `中文`; in Chinese mode it shows `EN`.
  - Tooltip text also aligned with target action.

## Verification
- Local production build passed (`npm run build` in `www`).
- Automated browser check on local start (`/docs/faq`):
  - Initial state: button shows `中文`, page content English.
  - Click once: button shows `EN`, docs body switches to Chinese.

## Notes
- Built-in Nextra framework strings such as `On This Page`, `Scroll to top`, `Last updated on` are still framework-level text and not yet fully localized by this patch.
