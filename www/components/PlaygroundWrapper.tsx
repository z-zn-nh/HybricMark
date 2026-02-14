import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Editor } from '@tiptap/core'

const SAMPLE = `# HybricMark Playground\n\nStart typing here...\n\n- Right click for context menu\n- Use markdown shortcuts\n- Keep block IDs stable`
const HybricEditor = dynamic(
  () => import('hybricmark').then((mod) => mod.HybricEditor),
  { ssr: false },
)

export function PlaygroundWrapper() {
  const [json, setJson] = useState<object | null>(null)
  const content = useMemo(() => SAMPLE, [])

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '16px 0 24px' }}>
      <div style={{ border: '1px solid #e4e4e7', borderRadius: 12, padding: 16 }}>
        <HybricEditor
          content={content}
          onChange={(editor: Editor) => setJson(editor.getJSON())}
        />
      </div>
      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer' }}>Editor JSON</summary>
        <pre style={{ marginTop: 10, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify(json, null, 2)}
        </pre>
      </details>
    </div>
  )
}
