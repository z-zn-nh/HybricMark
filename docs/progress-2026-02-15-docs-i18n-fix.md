# Progress - 2026-02-15 - Docs Chinese Toggle Fix

## Context
User reported that clicking the language toggle (`EN`/`中文`) only changed the button state, while docs body content stayed English.

## Root Cause
Language state (`data-doc-lang`) was implemented, but almost all documentation pages were hardcoded English MDX content.

## Changes
- Upgraded documentation pages to true runtime bilingual rendering via `I18nText` from `www/components/site/I18nProvider.tsx`.
- Updated files:
  - `www/pages/docs/index.mdx`
  - `www/pages/docs/getting-started.mdx`
  - `www/pages/docs/api.mdx`
  - `www/pages/docs/concepts.mdx`
  - `www/pages/docs/limits.mdx`
  - `www/pages/docs/faq.mdx`
  - `www/pages/docs/guides/image-upload.mdx`
  - `www/pages/docs/guides/saving.mdx`
  - `www/pages/docs/guides/security.mdx`
  - `www/pages/docs/guides/slash-menu.mdx`
  - `www/pages/docs/guides/ssr.mdx`
  - `www/pages/docs/guides/styling.mdx`
  - `www/pages/docs/guides/troubleshooting.mdx`
- Improved sidebar labels to bilingual static copy:
  - `www/pages/docs/_meta.ts`
  - `www/pages/docs/guides/_meta.ts`

## Verification
- Local build passed: `npm run build` in `www`.
- Playwright validation on local production server (`localhost:3200`):
  - Before toggle: page content in English.
  - After clicking `.hm-site-control-lang`: headings/body switched to Chinese (verified on `/docs/getting-started`).

## Notes
- This fix addresses docs content localization; deployment still requires fresh Vercel build from updated commit.
