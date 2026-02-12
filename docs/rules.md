# Development Rules & Implementation Guide

## 1. The "Hybrid" Editing Logic

We do NOT want a full source-code mode. We want a "Live Preview" with smart editing.

### Standard Marks (Bold, Italic, Strike)

- **Behavior:** Standard WYSIWYG.
- **Interaction:** Clicking `**bold**` keeps it rendered as Bold. No source expansion.
- **Editing:** User uses Context Menu or Shortcuts (Cmd+B) to toggle.

### Complex Nodes (Links, Math, HTML)

- **Implementation:** Must use `ReactNodeViewRenderer`.
- **States:**
  - **Blur (Preview):** Render the final output (e.g., `<a>`, `<Latex>`).
  - **Focus (Edit):** Render a visually distinct container (e.g., gray background, monospace font) showing the raw source (e.g., `[text](url)`).
- **Goal:** Allow precise editing of hidden attributes (URL, Formulas) without a popup modal, while keeping the document clean.

## 2. Block Identity (The "Card" System)

The ultimate goal of this editor is to allow extracting blocks into a Whiteboard/Mindmap.

- **Rule:** The `unique-id` extension must be configured for: `heading`, `paragraph`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`.
- **Export:** When `onExtract` is called, we must return the Node's `id` and its JSON content.

## 3. Interaction Design (Context Menu First)

Since there is no Toolbar:

- **Right Click (Context Menu):** The primary UI.
  - _Selection Mode:_ Bold, Italic, Extract to Card.
  - _Block Mode:_ Copy Block Link, Delete Block, Turn Into...
  - _Insert Mode:_ Insert Image, Table, Math.
- **Slash Command:** Typing `/` at the start of a paragraph should trigger a suggestion menu (Heading 1, Bullet List, etc.).

## 4. Engineering Constraints

- **Components:** All internal components (Menus, NodeViews) must be inside `src/lib/components`.
- **Styles:** Use `tailwind-merge` to allow users to override styles via the `className` prop, but ensure base styles are robust.
- **Vite Config:** Ensure `build.lib` is correctly set up to output `hybricmark.js` and `style.css`.
