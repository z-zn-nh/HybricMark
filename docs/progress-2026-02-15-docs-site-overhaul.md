# Progress Report - 2026-02-15 - Docs Site UX + Content Overhaul

## Scope
- Refined `www` documentation site UX and information density.
- Fixed homepage/playground editor rendering + editability in docs site runtime.
- Added top-right controls (GitHub, one-click theme toggle, one-click language toggle).
- Expanded documentation pages for production integration.

## Key Changes

### Runtime integration stability
- `www/components/HybridEditorClient.tsx`
  - Uses local source editor (`../../src/lib/components/HybricEditor`) with client-only mount guard.
  - Prevents SSR hydration issues while keeping docs live demo editable.

- `www/next.config.mjs`
  - Keeps `experimental.externalDir: true`.
  - Adds webpack alias to force single React/ReactDOM resolution from `www/node_modules`.

- `www/pages/_app.tsx`
  - Loads editor styles from local source: `../../src/lib/styles/editor.css`.
  - Keeps KaTeX styles and global docs styles.

### UI improvements
- `www/components/site/TopRightControls.tsx`
  - Fixed language labels and titles.
  - One-click theme toggle and language toggle.

- `www/pages/index.tsx`
  - Rebuilt as content-dense landing page with 5 major sections.
  - Added interactive seeded editor in hero.
  - Added fixed top-right controls for raw landing layout.

- `www/components/PlaygroundWithDevTools.tsx`
  - Larger split layout.
  - Seeded editable content + real-time JSON panel.
  - Adds route class to hide sidebar/toc on playground route.

- `www/styles.css`
  - Hides bottom sidebar footer theme control.
  - Adds route-scoped playground layout overrides to hide sidebar/toc and expand content width.

### Documentation content expansion
Updated or added:
- `www/pages/docs/index.mdx`
- `www/pages/docs/getting-started.mdx`
- `www/pages/docs/api.mdx`
- `www/pages/docs/concepts.mdx`
- `www/pages/docs/limits.mdx`
- `www/pages/docs/faq.mdx`
- `www/pages/docs/guides/saving.mdx`
- `www/pages/docs/guides/styling.mdx`
- `www/pages/docs/guides/image-upload.mdx`
- `www/pages/docs/guides/slash-menu.mdx`
- `www/pages/docs/guides/ssr.mdx`
- `www/pages/docs/guides/security.mdx`
- `www/pages/docs/guides/troubleshooting.mdx`

## Verification

### Build
- `npm --prefix www run build` ✅
- `npm run vercel-build` ✅ (includes docs build + `.vercel_static` generation)

### Automated browser checks (Playwright)
Validated on local docs server:
- Homepage:
  - Hero editor exists and is editable (`contenteditable=true`) ✅
  - Seed content visible ✅
  - Top-right controls visible ✅
  - Language toggle updates heading text EN/ZH ✅
- Playground:
  - Editor exists and editable ✅
  - Real-time JSON includes block IDs ✅
  - Sidebar hidden for full-width experience ✅
  - Navbar controls visible ✅
- API page:
  - Props table present ✅
  - Methods and data-structure sections present ✅
  - No console errors in inspected flows ✅

## Notes
- Docs site demos now run against local source to avoid published package SSR/runtime incompatibility in current pipeline.
- This keeps docs and implementation aligned while preserving Vercel build compatibility.

## Hotfix: Vercel Root=www dependency resolution (2026-02-15)
- Problem: with `Root Directory = www` and `externalDir` enabled, docs imports from `../src` resolved modules from workspace root (`/node_modules`) while install only provided `/www/node_modules`, causing errors like `Cannot find module '@radix-ui/react-context-menu'`.
- Fix: `www/scripts/prebuild-clean.mjs` now creates a link from workspace root `node_modules` to `www/node_modules` when root node_modules is missing.
- Result: `npm run vercel-build` succeeds in the current setup without changing locked Vercel UI build fields.
