import { useEffect, useMemo, useState } from 'react'

import { HybridEditorClient } from './HybridEditorClient'
import { useI18n } from './site/I18nProvider'

const DEMO_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Playground Document' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is a real editor instance. Type on the left and inspect document JSON on the right.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Try These Actions' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use right-click context menu' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Type markdown shortcuts: ##, -, >, ```' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Observe attrs.id updating in JSON output' }] }],
        },
      ],
    },
  ],
}

export function PlaygroundWithDevTools() {
  const { language } = useI18n()
  const [json, setJson] = useState<object>(DEMO_CONTENT)
  const initialContent = useMemo(() => DEMO_CONTENT, [])

  useEffect(() => {
    document.body.classList.add('hm-playground-route')
    return () => {
      document.body.classList.remove('hm-playground-route')
    }
  }, [])

  const copy =
    language === 'zh'
      ? {
          title: '在线 Playground',
          subtitle: '左侧输入，右侧实时查看 JSON（含块级 id）。',
          left: '编辑器',
          right: 'JSON 输出（实时）',
        }
      : {
          title: 'Live Playground',
          subtitle: 'Edit on the left, inspect live JSON with block ids on the right.',
          left: 'Editor',
          right: 'JSON Output (Real-time)',
        }

  return (
    <section className="hm-playground-page">
      <header className="hm-playground-top">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </header>

      <div className="hm-playground-layout">
        <article className="hm-playground-panel hm-playground-panel-editor">
          <div className="hm-playground-panel-head">{copy.left}</div>
          <div className="hm-playground-panel-body hm-playground-editor-body">
            <HybridEditorClient
              content={initialContent}
              editable
              onChange={(editor) => setJson(editor.getJSON())}
            />
          </div>
        </article>

        <aside className="hm-playground-panel hm-playground-panel-json">
          <div className="hm-playground-panel-head">{copy.right}</div>
          <pre className="hm-playground-json">{JSON.stringify(json, null, 2)}</pre>
        </aside>
      </div>

      <style jsx>{`
        .hm-playground-page {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 10px 0 28px;
        }

        .hm-playground-top {
          margin-bottom: 14px;
        }

        .hm-playground-top h1 {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .hm-playground-top p {
          margin: 8px 0 0;
          color: #64748b;
        }

        .hm-playground-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(380px, 1fr);
          gap: 16px;
        }

        .hm-playground-panel {
          border: 1px solid #d7e0f2;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        }

        .hm-playground-panel-head {
          padding: 11px 14px;
          border-bottom: 1px solid #e3e8f4;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
        }

        .hm-playground-panel-body {
          padding: 16px;
          min-height: 74vh;
          max-height: 74vh;
          overflow: auto;
        }

        .hm-playground-editor-body {
          background: #fff;
        }

        .hm-playground-panel-json {
          border-color: #122241;
          background: #081328;
        }

        .hm-playground-panel-json .hm-playground-panel-head {
          color: #93c5fd;
          border-bottom-color: #16325d;
        }

        .hm-playground-json {
          margin: 0;
          padding: 16px;
          min-height: 74vh;
          max-height: 74vh;
          overflow: auto;
          white-space: pre;
          font-size: 12px;
          line-height: 1.6;
          color: #dbeafe;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
        }

        @media (max-width: 1200px) {
          .hm-playground-layout {
            grid-template-columns: 1fr;
          }

          .hm-playground-panel-body,
          .hm-playground-json {
            min-height: 54vh;
            max-height: 54vh;
          }
        }

        :global(html.dark) .hm-playground-top h1 {
          color: #f8fafc;
        }

        :global(html.dark) .hm-playground-top p {
          color: #94a3b8;
        }

        :global(html.dark) .hm-playground-panel {
          border-color: #334155;
          background: rgba(15, 23, 42, 0.86);
        }

        :global(html.dark) .hm-playground-panel-head {
          border-bottom-color: #334155;
          color: #94a3b8;
        }

        :global(html.dark) .hm-playground-editor-body {
          background: rgba(15, 23, 42, 0.75);
        }
      `}</style>
    </section>
  )
}
