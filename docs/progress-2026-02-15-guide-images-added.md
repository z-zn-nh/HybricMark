# Progress - 2026-02-15 - Added Image Upload Guide

## Task
Create a detailed best-practice guide: `www/pages/docs/guides/images.mdx` titled "Handling Image Uploads".

## Changes
- Added new guide page:
  - `www/pages/docs/guides/images.mdx`
- Covered required sections:
  - Problem: Base64 image persistence drawbacks
  - Solution: `uploadFn` / manual upload via `editorProps`
  - Full code example with `uploadToCloudinary(file)`
  - Paste/drop handling and image insertion command
  - UX recommendations and security checklist
- Updated docs navigation:
  - `www/pages/docs/guides/_meta.ts` (added `images` entry)
  - `www/pages/docs/index.mdx` (guide link points to `/docs/guides/images`)

## Verification
- Build passed in docs app (`npm run build` under `www`).
- New route generated: `/docs/guides/images`.

## Notes
Legacy page `/docs/guides/image-upload` remains in repo for compatibility, while new canonical page is `/docs/guides/images`.
