import { useMemo, useState } from 'react'
import {
  Atom,
  Code,
  Command,
  Database,
  Edit3,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react'

import { HybridEditorClient } from '../components/HybridEditorClient'
import { TopRightControls } from '../components/site/TopRightControls'
import { useI18n } from '../components/site/I18nProvider'

const HERO_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Introduction to HybricMark' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'HybricMark combines WYSIWYG writing with Markdown shortcuts. Type "/" to open commands.',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Built on Tiptap, but focused on production needs: IDs, context actions, and stable persistence.',
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Features' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Unique Block IDs' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Typora-like context menu' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Table controls, footnotes, and math support' }] }],
        },
      ],
    },
  ],
}

const OLD_WAY = `const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Write...' }),
    UniqueID.configure({ types: ['paragraph', 'heading', 'listItem'] }),
    Table.configure({ resizable: true }),
  ],
  content: initial,
  onUpdate: ({ editor }) => setLocalState(editor.getJSON()),
  editorProps: {
    handleKeyDown(view, event) {
      // custom glue code
    },
  },
})`

const NEW_WAY = `<HybricEditor
  content={initialDoc}
  onDebouncedUpdate={({ editor }) => save(editor.getJSON())}
/>`

const stack = [
  { label: 'React', icon: Atom },
  { label: 'TypeScript', icon: Code },
  { label: 'Tiptap', icon: Command },
  { label: 'Tailwind CSS', icon: Layers },
]

const cards = [
  {
    title: 'Block Identity',
    desc: 'Database-ready JSON with UUIDs for every paragraph, heading, and list item.',
    icon: Database,
  },
  {
    title: 'Keyboard First',
    desc: 'Markdown shortcuts and context commands keep writing flow uninterrupted.',
    icon: Command,
  },
  {
    title: 'Headless UI',
    desc: 'Drop into your design system and style with your own Tailwind tokens.',
    icon: Layers,
  },
  {
    title: 'React + TypeScript',
    desc: 'Typed callbacks and extension composition for safe integration.',
    icon: Code,
  },
  {
    title: 'Performance',
    desc: 'Optimized for long documents with practical rendering safeguards.',
    icon: Zap,
  },
  {
    title: 'Extensible Core',
    desc: 'Keep StarterKit defaults and append custom Tiptap extensions as needed.',
    icon: Edit3,
  },
]

const copy = {
  en: {
    heroEyebrow: 'Headless editor infrastructure for React products',
    heroTitle: 'The Editor Your Users Actually Want.',
    heroSub: 'Headless. Block-based. Markdown-first. Built for React & Next.js.',
    getStarted: 'Get Started',
    tryPlayground: 'Try Playground',
    liveDemo: 'Live Demo',
    stackTitle: 'Built with power tools:',
    dxTitle: 'Developer Experience',
    dxSub: 'Stop writing boilerplate. Start shipping.',
    oldWay: 'The Old Way',
    oldWaySub: 'Manual Tiptap wiring',
    newWay: 'The Hybric Way',
    newWaySub: 'Small API surface',
    bentoTitle: 'Feature Density',
    bentoSub: 'Everything needed to ship a production markdown editor.',
    ctaTitle: 'Build your next note app today.',
    ctaSub: 'Bring stable block IDs and modern editing UX into your product quickly.',
    copied: 'Copied!',
    install: 'npm install hybricmark',
  },
  zh: {
    heroEyebrow: '面向 React 产品的无头编辑器基础设施',
    heroTitle: '你的用户真正愿意使用的编辑器。',
    heroSub: '无头架构、块级数据、Markdown 优先。为 React 与 Next.js 打造。',
    getStarted: '快速开始',
    tryPlayground: '打开 Playground',
    liveDemo: '在线演示',
    stackTitle: '技术栈：',
    dxTitle: '开发体验',
    dxSub: '少写样板代码，更快交付功能。',
    oldWay: '传统做法',
    oldWaySub: '手动拼装 Tiptap',
    newWay: 'Hybric 方式',
    newWaySub: '更小的集成面',
    bentoTitle: '能力矩阵',
    bentoSub: '覆盖生产级 Markdown 编辑器落地所需核心能力。',
    ctaTitle: '现在就开始构建你的下一代笔记应用。',
    ctaSub: '把稳定的块级 ID 与现代编辑体验快速带入你的产品。',
    copied: '已复制',
    install: 'npm install hybricmark',
  },
} as const

export default function HomePage() {
  const { language } = useI18n()
  const [copied, setCopied] = useState(false)
  const text = language === 'zh' ? copy.zh : copy.en
  const installCommand = useMemo(() => 'npm install hybricmark', [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="hmk-home">
      <div className="hmk-glow hmk-glow-a" aria-hidden />
      <div className="hmk-glow hmk-glow-b" aria-hidden />
      <div className="hmk-top-controls">
        <TopRightControls />
      </div>

      <section className="hmk-shell hmk-hero">
        <p className="hmk-badge">
          <Sparkles size={14} />
          <span>{text.heroEyebrow}</span>
        </p>

        <h1 className="hmk-title">{text.heroTitle}</h1>
        <p className="hmk-subtitle">{text.heroSub}</p>

        <div className="hmk-actions">
          <a className="hmk-btn hmk-btn-primary" href="/docs/getting-started">
            {text.getStarted}
          </a>
          <a className="hmk-btn hmk-btn-secondary" href="/playground">
            {text.tryPlayground}
          </a>
        </div>

        <div className="hmk-window">
          <div className="hmk-window-top">
            <span className="hmk-dot hmk-dot-red" />
            <span className="hmk-dot hmk-dot-yellow" />
            <span className="hmk-dot hmk-dot-green" />
            <span className="hmk-window-title">{text.liveDemo}</span>
          </div>
          <div className="hmk-window-body">
            <HybridEditorClient content={HERO_CONTENT} editable />
          </div>
        </div>
      </section>

      <section className="hmk-shell hmk-stack">
        <p className="hmk-stack-title">{text.stackTitle}</p>
        <div className="hmk-stack-grid">
          {stack.map((item) => {
            const Icon = item.icon
            return (
              <div className="hmk-chip" key={item.label}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="hmk-shell hmk-section">
        <header className="hmk-section-head">
          <h2>{text.dxTitle}</h2>
          <p>{text.dxSub}</p>
        </header>

        <div className="hmk-compare-grid">
          <article className="hmk-code-card">
            <h3>{text.oldWay}</h3>
            <p>{text.oldWaySub}</p>
            <pre>
              <code>{OLD_WAY}</code>
            </pre>
          </article>

          <article className="hmk-code-card hmk-code-card-new">
            <h3>{text.newWay}</h3>
            <p>{text.newWaySub}</p>
            <pre>
              <code>{NEW_WAY}</code>
            </pre>
          </article>
        </div>
      </section>

      <section className="hmk-shell hmk-section">
        <header className="hmk-section-head">
          <h2>{text.bentoTitle}</h2>
          <p>{text.bentoSub}</p>
        </header>
        <div className="hmk-bento-grid">
          {cards.map((item) => {
            const Icon = item.icon
            return (
              <article className="hmk-card" key={item.title}>
                <div className="hmk-card-icon">
                  <Icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="hmk-shell hmk-cta-wrap">
        <div className="hmk-cta">
          <h2>{text.ctaTitle}</h2>
          <p>{text.ctaSub}</p>
          <button type="button" className="hmk-cta-btn" onClick={handleCopy}>
            {copied ? text.copied : text.install}
          </button>
        </div>
      </section>

      <style jsx>{`
        .hmk-home {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding-bottom: 56px;
        }

        .hmk-shell {
          width: min(1180px, calc(100% - 36px));
          margin: 0 auto;
        }

        .hmk-top-controls {
          position: fixed;
          top: 16px;
          right: 18px;
          z-index: 50;
        }

        .hmk-glow {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(84px);
          pointer-events: none;
          z-index: 0;
        }

        .hmk-glow-a {
          top: -250px;
          left: -180px;
          background: rgba(59, 130, 246, 0.22);
        }

        .hmk-glow-b {
          top: -260px;
          right: -180px;
          background: rgba(14, 165, 233, 0.16);
        }

        .hmk-hero,
        .hmk-stack,
        .hmk-section,
        .hmk-cta-wrap {
          position: relative;
          z-index: 1;
        }

        .hmk-hero {
          padding-top: 72px;
          padding-bottom: 36px;
        }

        .hmk-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          border: 1px solid #d8e1f6;
          background: rgba(255, 255, 255, 0.82);
          color: #35508f;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hmk-title {
          margin: 16px 0 10px;
          font-size: clamp(2rem, 5.8vw, 4rem);
          line-height: 1.05;
          letter-spacing: -0.05em;
          font-weight: 800;
          color: #0f172a;
        }

        .hmk-subtitle {
          margin: 0;
          max-width: 760px;
          color: #5b6478;
          font-size: clamp(1rem, 2.2vw, 1.2rem);
          line-height: 1.7;
        }

        .hmk-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
          margin-bottom: 28px;
        }

        .hmk-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          padding: 10px 18px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: transform 0.18s ease;
        }

        .hmk-btn:hover {
          transform: translateY(-1px);
        }

        .hmk-btn-primary {
          color: #fff;
          background: linear-gradient(120deg, #1d4ed8, #2563eb 52%, #0ea5e9);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.35);
        }

        .hmk-btn-secondary {
          color: #1e293b;
          border: 1px solid #d1dbe9;
          background: rgba(255, 255, 255, 0.85);
        }

        .hmk-window {
          border: 1px solid #dbe4f1;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.84);
          box-shadow: 0 28px 80px rgba(15, 23, 42, 0.16);
        }

        .hmk-window-top {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 14px;
          background: rgba(248, 250, 254, 0.9);
          border-bottom: 1px solid #e2e8f0;
        }

        .hmk-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .hmk-dot-red { background: #fb7185; }
        .hmk-dot-yellow { background: #facc15; }
        .hmk-dot-green { background: #34d399; }

        .hmk-window-title {
          margin-left: 8px;
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .hmk-window-body {
          min-height: 460px;
          max-height: 460px;
          overflow: auto;
          padding: 18px 20px;
          background: #fff;
        }

        .hmk-stack {
          padding-top: 8px;
          padding-bottom: 42px;
        }

        .hmk-stack-title {
          margin: 0 0 12px;
          font-size: 12px;
          color: #7a8398;
          letter-spacing: 0.12em;
          font-weight: 700;
          text-transform: uppercase;
        }

        .hmk-stack-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .hmk-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #dbe2f2;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.84);
          color: #55627f;
          font-size: 14px;
          font-weight: 700;
          padding: 12px;
        }

        .hmk-section {
          padding-top: 4px;
          padding-bottom: 42px;
        }

        .hmk-section-head h2 {
          margin: 0;
          font-size: clamp(1.5rem, 3.8vw, 2.2rem);
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .hmk-section-head p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 1rem;
        }

        .hmk-compare-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .hmk-code-card {
          border: 1px solid #dbe2f2;
          border-radius: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .hmk-code-card h3 {
          margin: 0;
          color: #111827;
          font-size: 18px;
        }

        .hmk-code-card p {
          margin: 6px 0 10px;
          color: #64748b;
          font-size: 14px;
        }

        .hmk-code-card pre {
          margin: 0;
          border-radius: 12px;
          overflow: auto;
          padding: 12px;
          font-size: 12px;
          line-height: 1.55;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
          background: #0f172a;
          color: #dbeafe;
        }

        .hmk-code-card-new pre {
          background: #0b1324;
          color: #bfdbfe;
        }

        .hmk-bento-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .hmk-card {
          border: 1px solid #dde5f4;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.85);
          padding: 16px;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
        }

        .hmk-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d6e0f8;
          background: #eef4ff;
          color: #2563eb;
        }

        .hmk-card h3 {
          margin: 12px 0 8px;
          color: #1f2937;
          font-size: 17px;
        }

        .hmk-card p {
          margin: 0;
          color: #61708b;
          line-height: 1.6;
          font-size: 14px;
        }

        .hmk-cta-wrap {
          padding-top: 8px;
          padding-bottom: 72px;
        }

        .hmk-cta {
          border: 1px solid rgba(172, 191, 235, 0.55);
          border-radius: 18px;
          padding: 42px 28px;
          background: linear-gradient(120deg, rgba(37, 99, 235, 0.16), rgba(14, 165, 233, 0.14), rgba(99, 102, 241, 0.18));
          box-shadow: 0 22px 56px rgba(37, 99, 235, 0.16);
        }

        .hmk-cta h2 {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .hmk-cta p {
          margin: 10px 0 0;
          max-width: 760px;
          line-height: 1.7;
          color: #334155;
        }

        .hmk-cta-btn {
          margin-top: 18px;
          border: none;
          border-radius: 12px;
          background: #0f172a;
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 800;
          padding: 12px 18px;
          cursor: pointer;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.35);
        }

        @media (max-width: 980px) {
          .hmk-compare-grid { grid-template-columns: 1fr; }
          .hmk-stack-grid,
          .hmk-bento-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 680px) {
          .hmk-shell { width: calc(100% - 20px); }
          .hmk-stack-grid,
          .hmk-bento-grid { grid-template-columns: 1fr; }
          .hmk-window-body { min-height: 380px; max-height: 380px; padding: 12px; }
          .hmk-cta { padding: 28px 18px; }
        }

        :global(html.dark) .hmk-title,
        :global(html.dark) .hmk-section-head h2,
        :global(html.dark) .hmk-code-card h3,
        :global(html.dark) .hmk-card h3,
        :global(html.dark) .hmk-cta h2 {
          color: #f8fafc;
        }

        :global(html.dark) .hmk-subtitle,
        :global(html.dark) .hmk-section-head p,
        :global(html.dark) .hmk-code-card p,
        :global(html.dark) .hmk-card p,
        :global(html.dark) .hmk-cta p {
          color: #94a3b8;
        }

        :global(html.dark) .hmk-badge,
        :global(html.dark) .hmk-chip,
        :global(html.dark) .hmk-window,
        :global(html.dark) .hmk-code-card,
        :global(html.dark) .hmk-card {
          background: rgba(15, 23, 42, 0.72);
          border-color: #334155;
          color: #cbd5e1;
        }

        :global(html.dark) .hmk-window-top {
          background: rgba(15, 23, 42, 0.92);
          border-color: #334155;
        }

        :global(html.dark) .hmk-window-body {
          background: rgba(15, 23, 42, 0.75);
        }

        :global(html.dark) .hmk-window-title {
          color: #94a3b8;
        }

        :global(html.dark) .hmk-btn-secondary {
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.72);
          border-color: #334155;
        }

        :global(html.dark) .hmk-card-icon {
          background: rgba(37, 99, 235, 0.2);
          border-color: #3b82f6;
          color: #93c5fd;
        }

        :global(html.dark) .hmk-cta {
          border-color: #334155;
          background: linear-gradient(120deg, rgba(37, 99, 235, 0.24), rgba(30, 64, 175, 0.2), rgba(79, 70, 229, 0.24));
        }
      `}</style>
    </main>
  )
}
