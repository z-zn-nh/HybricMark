import { Hero } from '../components/landing/Hero'
import { Features } from '../components/landing/Features'
import type { CSSProperties } from 'react'

const quickStartSnippet = `import { HybricEditor } from 'hybricmark'

<HybricEditor
  content={initialContent}
  onDebouncedUpdate={({ editor }) => {
    saveToDB(editor.getJSON())
  }}
/>`

const comparisonRows = [
  {
    label: 'Block IDs out of the box',
    hybricmark: 'Yes',
    rawTiptap: 'Manual wiring',
  },
  {
    label: 'Typora-like context interaction',
    hybricmark: 'Built-in',
    rawTiptap: 'Manual implementation',
  },
  {
    label: 'Database-friendly callbacks',
    hybricmark: 'Debounced update API',
    rawTiptap: 'Manual debounce needed',
  },
]

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />

      <section className="hmk-landing-shell" style={{ paddingBottom: 24 }}>
        <div className="hmk-section-head">
          <p className="hmk-eyebrow">DEVELOPER EXPERIENCE</p>
          <h2 className="hmk-section-title">Drop-in API, production-ready data flow</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 16,
          }}
        >
          <article className="hmk-feature-card" style={{ background: '#0f172a', color: '#e5e7eb' }}>
            <h3 style={{ marginTop: 0 }}>Quick Start</h3>
            <pre
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.65,
                overflowX: 'auto',
                whiteSpace: 'pre',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
              }}
            >
              <code>{quickStartSnippet}</code>
            </pre>
          </article>

          <article className="hmk-feature-card">
            <h3 style={{ marginTop: 0 }}>Why teams choose HybricMark</h3>
            <p>
              You keep Tiptap flexibility, but skip repetitive integration work for block identity,
              context actions, and practical save pipelines.
            </p>
          </article>
        </div>
      </section>

      <section className="hmk-landing-shell" style={{ paddingBottom: 96 }}>
        <div className="hmk-section-head">
          <p className="hmk-eyebrow">COMPARISON</p>
          <h2 className="hmk-section-title">HybricMark vs raw setup</h2>
        </div>

        <div className="hmk-feature-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f6ff' }}>
                <th style={thStyle}>Capability</th>
                <th style={thStyle}>HybricMark</th>
                <th style={thStyle}>Raw Tiptap</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td style={tdStyle}>{row.label}</td>
                  <td style={tdStyle}>{row.hybricmark}</td>
                  <td style={tdStyle}>{row.rawTiptap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  borderBottom: '1px solid #dfe5f3',
  fontSize: 13,
  color: '#1f2a44',
}

const tdStyle: CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid #e7ebf5',
  fontSize: 14,
  color: '#45506a',
}
