# Progress - 2026-02-13 - QA Hardening Pass

## Scope
- QA follow-up fixes after comprehensive self-inspection.
- Kept current context-menu strategy unchanged (per product decision).

## Changes
- Security hardening in `HybricEditor`:
  - Added HTML sanitization for markdown-rendered and direct HTML input.
  - Strips dangerous tags (`script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, `form`).
  - Strips event-handler/style/srcdoc attributes.
  - Filters unsafe URL attributes and allows only safe protocols (`http`, `https`, `mailto`, `tel`, `#`, `data:image/*`).
  - Added safe-URL guard before external `window.open`.
- UX hardening (non-blocking behavior):
  - Removed `window.prompt`/`window.alert` fallback flows in context-menu actions.
  - `copy` now uses native clipboard first, then `execCommand('copy')` fallback, then toast.
  - `paste` fallback changed to toast guidance (`Ctrl+V`) instead of blocking prompt.
  - Math insertion now inserts default/selected expression directly (no modal prompt).
  - Table merge invalid-state feedback now uses toast.
- Style isolation:
  - Removed global `.ProseMirror > *` selectors from `editor.css`.
  - Containment rules now scoped to `.hm-editor-root .hm-editor-content.ProseMirror > *`.
- Packaging compliance:
  - Moved `react` and `react-dom` to `peerDependencies`.
  - Kept them in `devDependencies` for local playground/dev builds.
- QA automation script aligned with latest product strategy:
  - Updated `tests/e2e.spec.ts` to remove deprecated checks and keep core UX verification.

## Verification
- `npm run build` passed.
- `npx playwright test tests/e2e.spec.ts --reporter=line` passed.
