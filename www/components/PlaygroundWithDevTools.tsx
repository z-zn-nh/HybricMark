import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { HybricEditorProps } from '@hybricmark/core'

const DEMO_CONTENT = `# HybricMark Playground

Type in the editor and inspect real-time JSON on the right.

- Every block has an id
- Right click for context actions
- Markdown shortcuts are enabled`

const HybricEditor = dynamic<HybricEditorProps>(
  () => import('@hybricmark/core').then((mod) => mod.HybricEditor),
  { ssr: false },
)

export function PlaygroundWithDevTools() {
  const [json, setJson] = useState<object>({})
  const initialContent = useMemo(() => DEMO_CONTENT, [])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 460px)',
        gap: 16,
        width: '100%',
        maxWidth: 1320,
        margin: '0 auto',
        padding: '12px 0 24px',
      }}
    >
      <section
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          background: '#fff',
          minHeight: '76vh',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #eef0f3',
            fontSize: 12,
            letterSpacing: '0.08em',
            color: '#6b7280',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Editor
        </div>
        <div style={{ padding: 14 }}>
          <HybricEditor
            content={initialContent}
            onChange={(editor) => {
              setJson(editor.getJSON())
            }}
          />
        </div>
      </section>

      <aside
        style={{
          border: '1px solid #1f2937',
          borderRadius: 12,
          background: '#0b1220',
          color: '#e5e7eb',
          minHeight: '76vh',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #1f2937',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#93c5fd',
            fontWeight: 700,
          }}
        >
          JSON Output (Real-time)
        </div>
        <pre
          style={{
            margin: 0,
            padding: 14,
            height: 'calc(76vh - 40px)',
            overflow: 'auto',
            fontSize: 12,
            lineHeight: 1.6,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
            whiteSpace: 'pre',
          }}
        >
          {JSON.stringify(json, null, 2)}
        </pre>
      </aside>
    </div>
  )
}
