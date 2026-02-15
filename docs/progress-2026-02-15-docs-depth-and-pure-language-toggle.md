# Progress - 2026-02-15 - Docs Depth Upgrade + Pure Language Sidebar

## What was requested
1. Make documentation thicker and more professional (Concepts + Guides + Extensions, not only install/API).
2. Remove mixed bilingual sidebar labels like `Overview / 概览`.
3. Keep language switch behavior as pure locale output:
   - English mode: English-only labels
   - Chinese mode: Chinese-only labels

## Implemented changes

### 1) Documentation structure expanded
- Added Concepts section as a proper subtree:
  - `www/pages/docs/concepts/_meta.ts`
  - `www/pages/docs/concepts/index.mdx`
  - `www/pages/docs/concepts/block-identity.mdx`
  - `www/pages/docs/concepts/headless-design.mdx`
- Added Extensions reference page:
  - `www/pages/docs/extensions.mdx`
- Enhanced Guides depth:
  - `www/pages/docs/guides/images.mdx` (production image upload flow)
  - `www/pages/docs/guides/saving.mdx` (added HTML vs JSON comparison)
  - `www/pages/docs/guides/slash-menu.mdx` (added YouTube/Warning command recipes)

### 2) Navigation and page map cleanup
- Updated root docs map to include new sections:
  - `www/pages/docs/_meta.ts`
- Updated guides map and switched to English source labels only:
  - `www/pages/docs/guides/_meta.ts`
- Removed legacy duplicate guide page from sidebar surface:
  - deleted `www/pages/docs/guides/image-upload.mdx`
- Removed old single-file concepts page in favor of folder route:
  - deleted `www/pages/docs/concepts.mdx`

### 3) Pure-language switching (no mixed labels)
- Reworked UI text patcher in:
  - `www/components/site/I18nProvider.tsx`
- Behavior now:
  - translate framework strings (`On This Page`, `Scroll to top`, `Last updated on`, search placeholder)
  - translate sidebar/nav labels using EN↔ZH map
  - handle non-leaf DOM text nodes (labels with icons/toggles)
  - avoid observer self-loop with reentrancy guard

## Verification
- Build check passed: `npm run build` under `www`.
- Automated browser verification (Puppeteer) on local production server:
  - Chinese mode: Chinese-only sidebar labels, no mixed `A / B` format.
  - English mode after toggle: English-only sidebar labels, no Chinese remnants.
  - Search placeholder switches with language (`搜索文档…` / `Search documentation…`).

## Outcome
Docs now present a more complete developer-facing structure:
- Concepts (narrative and architecture)
- Guides (copy-paste recipes)
- Extensions (capability matrix)

And language UX is now pure-mode output rather than mixed bilingual labels.
