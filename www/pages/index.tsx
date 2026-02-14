import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Atom,
  Braces,
  Database,
  FileCode2,
  Keyboard,
  Layers,
  Move3D,
  Paintbrush,
  PenTool,
  Sparkles,
  Type,
  Wind,
} from 'lucide-react'
import type { HybricEditorProps } from '@hybricmark/core'

const HybricEditor = dynamic<HybricEditorProps>(
  () => import('@hybricmark/core').then((mod) => mod.HybricEditor),
  { ssr: false },
)

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
          text: 'HybricMark combines the best of WYSIWYG and Markdown. Try typing "/" to open the menu.',
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
              text: 'It is built on top of Tiptap but handles all the hard stuff for you.',
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
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Slash Commands' }] },
          ],
        },
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Bubble Menu' }] },
          ],
        },
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Unique Block IDs' }] },
          ],
        },
      ],
    },
  ],
}

const OLD_WAY = `import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import UniqueID from '@tiptap/extension-unique-id'

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Write...' }),
    UniqueID.configure({ types: ['paragraph', 'heading'] }),
  ],
  editorProps: { handleKeyDown, handlePaste },
  onUpdate: ({ editor }) => save(editor.getJSON()),
})`

const NEW_WAY = `<HybricEditor
  content={doc}
  onDebouncedUpdate={({ editor }) => save(editor.getJSON())}
/>`

const stack = [
  { name: 'React', icon: Atom },
  { name: 'TypeScript', icon: FileCode2 },
  { name: 'Tiptap', icon: PenTool },
  { name: 'Tailwind CSS', icon: Wind },
]

const featureCards = [
  {
    title: 'Block Identity',
    desc: 'Database-ready JSON with UUIDs for every block.',
    icon: Database,
  },
  {
    title: 'Keyboard First',
    desc: 'Markdown shortcuts (##, -, >) work out of the box.',
    icon: Keyboard,
  },
  {
    title: 'Headless UI',
    desc: 'Zero CSS included. Styled 100% via Tailwind.',
    icon: Paintbrush,
  },
  {
    title: 'Drag & Drop',
    desc: 'Reorder blocks easily (Coming soon).',
    icon: Move3D,
  },
  {
    title: 'TypeScript',
    desc: 'Fully typed API and props.',
    icon: Type,
  },
  {
    title: 'Extensible',
    desc: 'Add any Tiptap extension you need.',
    icon: Layers,
  },
]

export default function HomePage() {
  const [copied, setCopied] = useState(false)
  const installCommand = useMemo(() => 'npm install hybricmark', [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="hmk-home">
      <div className="hmk-glow hmk-glow-a" aria-hidden />
      <div className="hmk-glow hmk-glow-b" aria-hidden />

      <section className="hmk-shell hmk-hero">
        <div className="hmk-badge">
          <Sparkles size={14} />
          <span>Headless editor infra for serious products</span>
        </div>
        <h1 className="hmk-title">The Editor Your Users Actually Want.</h1>
        <p className="hmk-subtitle">
          Headless. Block-based. Markdown-first. Built for React & Next.js.
        </p>

        <div className="hmk-hero-actions">
          <a className="hmk-btn hmk-btn-primary" href="/docs/getting-started">
            Get Started
          </a>
          <a
            className="hmk-btn hmk-btn-secondary"
            href="https://github.com/z-zn-nh/HybricMark"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>

        <div className="hmk-window">
          <div className="hmk-window-top">
            <span className="hmk-dot hmk-dot-red" />
            <span className="hmk-dot hmk-dot-yellow" />
            <span className="hmk-dot hmk-dot-green" />
            <span className="hmk-window-title">Live Demo</span>
          </div>
          <div className="hmk-window-body">
            <HybricEditor content={HERO_CONTENT} className="hm-prose hm-max-w-none" />
          </div>
        </div>
      </section>

      <section className="hmk-shell hmk-stack">
        <p className="hmk-stack-title">Built with power tools:</p>
        <div className="hmk-stack-row">
          {stack.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.name} className="hmk-chip">
                <Icon size={16} />
                <span>{item.name}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="hmk-shell hmk-compare">
        <div className="hmk-section-head">
          <h2>Developer Experience</h2>
          <p>Stop writing boilerplate. Start shipping.</p>
        </div>

        <div className="hmk-compare-grid">
          <article className="hmk-code-card hmk-code-card-old">
            <h3>The Old Way</h3>
            <p>Native Tiptap setup</p>
            <pre>
              <code>{OLD_WAY}</code>
            </pre>
          </article>

          <article className="hmk-code-card hmk-code-card-new">
            <h3>The Hybric Way</h3>
            <p>Minimal API surface</p>
            <pre>
              <code>{NEW_WAY}</code>
            </pre>
          </article>
        </div>
      </section>

      <section className="hmk-shell hmk-bento-wrap">
        <div className="hmk-section-head">
          <h2>Feature Density</h2>
          <p>Everything you need to build production-grade writing flows.</p>
        </div>

        <div className="hmk-bento-grid">
          {featureCards.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="hmk-bento-card">
                <div className="hmk-bento-icon">
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
          <h2>Build your next Notion-clone today.</h2>
          <p>Bring structured content, stable block IDs, and modern editing UX into your product in hours.</p>
          <button type="button" onClick={handleCopy} className="hmk-cta-btn">
            {copied ? 'Copied!' : installCommand}
          </button>
        </div>
      </section>

      <style jsx>{`
        .hmk-home {
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          padding-bottom: 56px;
        }

        .hmk-shell {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .hmk-glow {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .hmk-glow-a {
          top: -220px;
          left: -180px;
          background: rgba(59, 130, 246, 0.22);
        }

        .hmk-glow-b {
          top: -260px;
          right: -180px;
          background: rgba(129, 140, 248, 0.2);
        }

        .hmk-hero,
        .hmk-stack,
        .hmk-compare,
        .hmk-bento-wrap,
        .hmk-cta-wrap {
          position: relative;
          z-index: 1;
        }

        .hmk-hero {
          padding-top: 72px;
          padding-bottom: 44px;
        }

        .hmk-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid #d8e1f6;
          background: rgba(255, 255, 255, 0.86);
          color: #35508f;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .hmk-title {
          margin: 18px 0 12px;
          font-size: clamp(2rem, 6vw, 4rem);
          line-height: 1.05;
          letter-spacing: -0.045em;
          font-weight: 800;
          color: #111827;
          max-width: 900px;
        }

        .hmk-subtitle {
          margin: 0;
          max-width: 760px;
          font-size: clamp(1rem, 2.2vw, 1.25rem);
          line-height: 1.7;
          color: #5b6478;
        }

        .hmk-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
          margin-bottom: 28px;
        }

        .hmk-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hmk-btn:hover {
          transform: translateY(-1px);
        }

        .hmk-btn-primary {
          color: #fff;
          background: linear-gradient(120deg, #1d4ed8, #3b82f6);
          box-shadow: 0 10px 26px rgba(37, 99, 235, 0.3);
        }

        .hmk-btn-secondary {
          color: #1f2c4d;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid #cfd8eb;
        }

        .hmk-window {
          border-radius: 18px;
          border: 1px solid #d9e1f1;
          background: rgba(255, 255, 255, 0.84);
          box-shadow: 0 28px 80px rgba(13, 23, 46, 0.18);
          overflow: hidden;
          backdrop-filter: blur(6px);
        }

        .hmk-window-top {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 14px;
          border-bottom: 1px solid #e2e8f0;
          background: rgba(248, 250, 254, 0.9);
        }

        .hmk-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          display: inline-block;
        }

        .hmk-dot-red {
          background: #fb7185;
        }

        .hmk-dot-yellow {
          background: #facc15;
        }

        .hmk-dot-green {
          background: #34d399;
        }

        .hmk-window-title {
          margin-left: 8px;
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .hmk-window-body {
          min-height: 440px;
          max-height: 440px;
          overflow: auto;
          padding: 18px 20px;
        }

        .hmk-stack {
          padding-top: 10px;
          padding-bottom: 42px;
        }

        .hmk-stack-title {
          margin: 0 0 14px;
          color: #7a8398;
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .hmk-stack-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .hmk-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #dbe2f2;
          background: rgba(255, 255, 255, 0.78);
          color: #55627f;
          font-weight: 700;
          font-size: 14px;
        }

        .hmk-compare {
          padding-top: 6px;
          padding-bottom: 42px;
        }

        .hmk-section-head h2 {
          margin: 0;
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          letter-spacing: -0.02em;
          color: #111827;
        }

        .hmk-section-head p {
          margin: 8px 0 0;
          color: #667085;
          font-size: 1rem;
        }

        .hmk-compare-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .hmk-code-card {
          border-radius: 16px;
          border: 1px solid #dbe3f3;
          padding: 16px;
          overflow: hidden;
          box-shadow: 0 14px 40px rgba(16, 24, 40, 0.08);
        }

        .hmk-code-card h3 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }

        .hmk-code-card p {
          margin: 6px 0 10px;
          font-size: 14px;
          color: #667085;
        }

        .hmk-code-card pre {
          margin: 0;
          border-radius: 12px;
          overflow: auto;
          padding: 12px;
          font-size: 12px;
          line-height: 1.6;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            Liberation Mono, monospace;
        }

        .hmk-code-card-old pre {
          background: #0f172a;
          color: #e2e8f0;
        }

        .hmk-code-card-new pre {
          background: #0b1324;
          color: #bfdbfe;
        }

        .hmk-bento-wrap {
          padding-top: 4px;
          padding-bottom: 48px;
        }

        .hmk-bento-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .hmk-bento-card {
          border-radius: 14px;
          border: 1px solid #dde5f4;
          background: rgba(255, 255, 255, 0.82);
          padding: 16px;
          box-shadow: 0 8px 20px rgba(16, 24, 40, 0.06);
        }

        .hmk-bento-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #d6e0f8;
          color: #2563eb;
          background: #eef4ff;
        }

        .hmk-bento-card h3 {
          margin: 12px 0 8px;
          font-size: 17px;
          color: #1f2937;
        }

        .hmk-bento-card p {
          margin: 0;
          color: #61708b;
          font-size: 14px;
          line-height: 1.6;
        }

        .hmk-cta-wrap {
          padding-top: 10px;
          padding-bottom: 72px;
        }

        .hmk-cta {
          border-radius: 18px;
          border: 1px solid rgba(172, 191, 235, 0.55);
          padding: 42px 28px;
          background: linear-gradient(
            120deg,
            rgba(37, 99, 235, 0.16),
            rgba(14, 165, 233, 0.14),
            rgba(99, 102, 241, 0.18)
          );
          box-shadow: 0 24px 60px rgba(37, 99, 235, 0.18);
        }

        .hmk-cta h2 {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .hmk-cta p {
          margin: 10px 0 0;
          max-width: 760px;
          color: #334155;
          line-height: 1.7;
        }

        .hmk-cta-btn {
          margin-top: 18px;
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 16px;
          font-weight: 800;
          color: #e5edff;
          background: #0f172a;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.36);
        }

        .hmk-cta-btn:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 980px) {
          .hmk-stack-row,
          .hmk-bento-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hmk-compare-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .hmk-shell {
            width: calc(100% - 20px);
          }

          .hmk-stack-row,
          .hmk-bento-grid {
            grid-template-columns: 1fr;
          }

          .hmk-window-body {
            min-height: 360px;
            max-height: 360px;
            padding: 12px;
          }

          .hmk-cta {
            padding: 30px 18px;
          }
        }

        :global(html.dark) .hmk-title,
        :global(html.dark) .hmk-section-head h2,
        :global(html.dark) .hmk-code-card h3,
        :global(html.dark) .hmk-bento-card h3,
        :global(html.dark) .hmk-cta h2 {
          color: #f8fafc;
        }

        :global(html.dark) .hmk-subtitle,
        :global(html.dark) .hmk-section-head p,
        :global(html.dark) .hmk-code-card p,
        :global(html.dark) .hmk-bento-card p,
        :global(html.dark) .hmk-cta p {
          color: #94a3b8;
        }

        :global(html.dark) .hmk-badge,
        :global(html.dark) .hmk-chip,
        :global(html.dark) .hmk-window,
        :global(html.dark) .hmk-code-card,
        :global(html.dark) .hmk-bento-card {
          background: rgba(15, 23, 42, 0.7);
          border-color: #334155;
          color: #cbd5e1;
        }

        :global(html.dark) .hmk-window-top {
          background: rgba(15, 23, 42, 0.9);
          border-color: #334155;
        }

        :global(html.dark) .hmk-window-title {
          color: #94a3b8;
        }

        :global(html.dark) .hmk-btn-secondary {
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.7);
          border-color: #334155;
        }

        :global(html.dark) .hmk-bento-icon {
          background: rgba(37, 99, 235, 0.18);
          border-color: #3b82f6;
          color: #93c5fd;
        }

        :global(html.dark) .hmk-cta {
          border-color: #334155;
          background: linear-gradient(
            120deg,
            rgba(37, 99, 235, 0.24),
            rgba(30, 64, 175, 0.2),
            rgba(79, 70, 229, 0.24)
          );
        }
      `}</style>
    </main>
  )
}
