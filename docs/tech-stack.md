# Tech Stack & Dependencies

## Core

- **Framework:** React 18+ (Functional Components, Hooks)
- **Language:** TypeScript 5+ (Strict Mode)
- **Build Tool:** Vite (Library Mode)
- **Package Manager:** npm

## Editor Engine

- **Core:** `@tiptap/react`, `@tiptap/pm`, `@tiptap/core`
- **Extensions:**
  - `@tiptap/starter-kit` (Base markdown rules)
  - `@tiptap/extension-unique-id` (CRITICAL: For Block IDs)
  - `@tiptap/extension-link` (Customized for Hybrid view)
  - `@tiptap/extension-placeholder`
  - `@tiptap/extension-typography`

## UI & Styling

- **CSS Framework:** Tailwind CSS (configured with `hm-` prefix)
- **Icons:** `lucide-react`
- **Components:** Radix UI Primitives (specifically `@radix-ui/react-context-menu`, `@radix-ui/react-popover`)
- **Utility:** `clsx`, `tailwind-merge`

## Testing (Future)

- Vitest
- Playwright
