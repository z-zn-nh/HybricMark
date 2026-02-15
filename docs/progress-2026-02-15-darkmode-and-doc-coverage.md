# Progress Report (2026-02-15)

## Scope
- Fix dark-mode readability issues for homepage/editor content.
- Expand docs coverage based on real `src/lib` implementation.

## Completed
- Added dark-mode editor typography/table/code/footnote overrides:
  - `src/lib/styles/editor.css`
- Reworked docs i18n patcher and fixed garbled Chinese text map:
  - `www/components/site/I18nProvider.tsx`
- Rewrote and expanded docs pages:
  - `www/pages/docs/index.mdx`
  - `www/pages/docs/api.mdx`
  - `www/pages/docs/extensions.mdx`
  - `www/pages/docs/concepts/index.mdx`
  - `www/pages/docs/concepts/block-identity.mdx`
  - `www/pages/docs/concepts/headless-design.mdx`
  - `www/pages/docs/guides/images.mdx`
- Added new practical guides from source capabilities:
  - `www/pages/docs/guides/tables.mdx`
  - `www/pages/docs/guides/links.mdx`
  - `www/pages/docs/guides/shortcuts.mdx`
  - `www/pages/docs/guides/footnotes-math.mdx`
- Updated guides navigation:
  - `www/pages/docs/guides/_meta.ts`

## Verification
- Root library build: `npm run build` passed.
- Docs build: `cd www && npm run build` passed.

## Notes
- `www/components/HybridEditorClient.tsx` remains sourced from local `src/lib` for Next SSR compatibility in this repo layout.
