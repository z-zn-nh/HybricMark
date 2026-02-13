# hybricmark

[![npm version](https://img.shields.io/npm/v/hybricmark.svg)](https://www.npmjs.com/package/hybricmark)

A Headless, Typora-like Markdown Editor for React. Built on Tiptap.

👉 [Live Demo & Docs](https://your-vercel-link-placeholder.com)

## Features

- Hybrid Editing (WYSIWYG + Markdown shortcuts).
- Unique Block IDs (Ready for block-based apps).
- Typora-style Context Menu.
- Performance optimized for large docs.

## Installation

```bash
npm install hybricmark
```

## Usage

```tsx
import { useState } from "react";
import { HybricEditor } from "hybricmark";

export default function App() {
  const [json, setJson] = useState(null);

  return (
    <div style={{ maxWidth: 860, margin: "40px auto" }}>
      <HybricEditor
        content="# Hello hybricmark\n\nStart typing..."
        editable
        onChange={(editor) => setJson(editor.getJSON())}
      />
      <pre style={{ marginTop: 24, fontSize: 12 }}>
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  );
}
```

## API

### `HybricEditor` Props

- `content?: Content` - Initial content.
- `editable?: boolean` - Whether the editor is editable.
- `onChange?: (editor) => void` - Called on editor updates.
- `onExtract?: (data: { id: string; content: JSON }) => void` - Called when extracting block data.
- `className?: string` - Custom wrapper class.

## Development

```bash
npm run dev
npm run lint
npm run build
```

## License

MIT
