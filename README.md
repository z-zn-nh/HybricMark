# hybricmark

[![npm version](https://img.shields.io/npm/v/hybricmark.svg)](https://www.npmjs.com/package/hybricmark)
[![license](https://img.shields.io/npm/l/hybricmark.svg)](./LICENSE)

Headless, Typora-like Markdown editor for React. Built on Tiptap.

- Live docs: https://txlan.top
- Playground: https://txlan.top/playground

## Why HybricMark

- Block-level UUIDs via `attrs.id` for product workflows (comments, references, patch updates).
- Typora-style writing UX (context menu + keyboard shortcuts + markdown shortcuts).
- Built-in table controls, footnotes, math, task lists, link interaction, and image support.
- Uncontrolled editor architecture optimized for IME safety and large-document usage.

## Install

```bash
npm install hybricmark @tiptap/core @tiptap/react @tiptap/starter-kit react react-dom
```

## Quick Start

```tsx
import { useState } from 'react'
import { HybricEditor } from 'hybricmark'
import 'hybricmark/style.css'
import 'katex/dist/katex.min.css'

export default function App() {
  const [doc, setDoc] = useState<object | null>(null)

  return (
    <div style={{ maxWidth: 920, margin: '40px auto' }}>
      <HybricEditor
        content="# Hello HybricMark\n\nType '/' for commands..."
        debounceMs={800}
        onChange={(editor) => setDoc(editor.getJSON())}
        onDebouncedUpdate={({ editor }) => {
          // Persist to DB/API here
          console.log('save', editor.getJSON())
        }}
      />

      <pre style={{ marginTop: 20, fontSize: 12 }}>
        {JSON.stringify(doc, null, 2)}
      </pre>
    </div>
  )
}
```

## Core API

`HybricEditor` props (high-level):

- `content?: string | JSONContent`
- `editable?: boolean`
- `placeholder?: string`
- `extensions?: Extension[]`
- `editorProps?: EditorProps`
- `debounceMs?: number`
- `onChange?: (editor: Editor) => void`
- `onUpdate?: ({ editor, transaction }) => void`
- `onDebouncedUpdate?: ({ editor, transaction }) => void`
- `onExtract?: (data: { id: string; content: JSONContent; text: string }) => void`

Full reference: https://txlan.top/docs/api

## Block Identity Example

```json
{
  "type": "paragraph",
  "attrs": {
    "id": "f7652fb0-0815-4f41-9efb-b67fe7b18390"
  },
  "content": [{ "type": "text", "text": "Block-level targeting" }]
}
```

## Notes for Next.js

- Mount editor client-side (`dynamic(..., { ssr: false })`) for editing surfaces.
- Keep editor uncontrolled during typing (especially Chinese IME scenarios).

## Docs Index

- Getting started: https://txlan.top/docs/getting-started
- API reference: https://txlan.top/docs/api
- Extensions: https://txlan.top/docs/extensions
- Guides:
  - Saving to DB
  - Image uploads
  - Tables
  - Links
  - Keyboard shortcuts
  - Footnotes & math

## Local Development

```bash
npm run dev
npm run lint
npm run build
```

## License

MIT
