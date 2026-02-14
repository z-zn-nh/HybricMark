import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Box,
  Code,
  Command,
  Edit3,
  Layers,
  Zap,
} from 'lucide-react'
import type { HybricEditorProps } from '@hybricmark/core'

const HybricEditor = dynamic<HybricEditorProps>(
  () => import('@hybricmark/core').then((mod) => mod.HybricEditor),
  { ssr: false },
)

const heroContent = `# Hello World
Try typing here! use '/' for commands.

- Block IDs are always stable
- Right click for context actions
- Headless UI, fully customizable`

const features = [
  {
    icon: Box,
    title: 'Block Identity',
    desc: 'Every block gets a UUID for deterministic references, annotations, and partial persistence.',
  },
  {
    icon: Command,
    title: 'Slash Menu',
    desc: "Built-in '/' command interaction for fast block transforms and insert workflows.",
  },
  {
    icon: Layers,
    title: 'Headless',
    desc: 'Own your UX. Keep the editor logic, replace or redesign every surface.',
  },
  {
    icon: Code,
    title: 'React & TypeScript',
    desc: 'Typed editor callbacks and extension composition for predictable integration.',
  },
  {
    icon: Zap,
    title: 'Performance',
    desc: 'Built for large docs with update control and pragmatic rendering safeguards.',
  },
  {
    icon: Edit3,
    title: 'Extensible',
    desc: 'Powered by Tiptap. Bring your own extensions or compose with existing ones.',
  },
]

const installCommand = 'npm install hybricmark @tiptap/react @tiptap/starter-kit'

const snippet = `import { HybricEditor } from '@hybricmark/core'
import StarterKit from '@tiptap/starter-kit'

<HybricEditor
  content={content}
  extensions={[StarterKit]}
  placeholder="Type '/' for commands..."
  onDebouncedUpdate={({ editor }) => saveDoc(editor.getJSON())}
/>`

const dataSnippet = `{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "id": "b1a2-3c4d", "level": 1 },
      "content": [{ "type": "text", "text": "Project Spec" }]
    },
    {
      "type": "paragraph",
      "attrs": { "id": "e5f6-7g8h" },
      "content": [{ "type": "text", "text": "Block-level updates are now trivial." }]
    }
  ]
}`

export default function HomePage() {
  const [copied, setCopied] = useState(false)
  const installCmd = useMemo(() => installCommand, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCmd)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="hm-w-full hm-overflow-x-hidden hm-bg-white hm-text-slate-900 dark:hm-bg-slate-950 dark:hm-text-slate-100">
      <div className="hm-pointer-events-none hm-absolute hm-inset-x-0 hm-top-0 hm-h-[520px] hm-bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.20),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.18),transparent_45%)] dark:hm-bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.26),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.22),transparent_45%)]" />

      <section className="hm-relative hm-w-full hm-max-w-7xl hm-mx-auto hm-px-6 hm-pt-24 hm-pb-16">
        <div className="hm-text-center hm-space-y-6">
          <h1 className="hm-text-5xl md:hm-text-6xl hm-font-bold hm-tracking-tight hm-leading-[1.03] hm-bg-clip-text hm-text-transparent hm-bg-gradient-to-r hm-from-slate-900 hm-via-blue-700 hm-to-indigo-600 dark:hm-from-slate-100 dark:hm-via-blue-300 dark:hm-to-indigo-300">
            Headless Editor Infrastructure for React.
          </h1>
          <p className="hm-max-w-3xl hm-mx-auto hm-text-lg hm-leading-8 hm-text-slate-600 dark:hm-text-slate-300">
            Unique Block IDs, Tiptap-compatible extensions, slash commands, and typed update callbacks for real production editing systems.
          </p>
          <div className="hm-inline-flex hm-items-center hm-gap-2 hm-rounded-xl hm-border hm-border-slate-200 hm-bg-white/80 hm-px-4 hm-py-2 hm-text-xs hm-font-medium hm-text-slate-600 dark:hm-border-slate-800 dark:hm-bg-slate-900/70 dark:hm-text-slate-300">
            <span>MIT Licensed</span>
            <span className="hm-text-slate-300 dark:hm-text-slate-600">•</span>
            <span>Tiptap-based</span>
            <span className="hm-text-slate-300 dark:hm-text-slate-600">•</span>
            <span>Block-first architecture</span>
          </div>
        </div>

        <div className="hm-mt-12 hm-max-w-4xl hm-mx-auto hm-rounded-xl hm-border hm-border-slate-200/80 hm-bg-white/80 hm-shadow-2xl hm-backdrop-blur dark:hm-border-slate-800 dark:hm-bg-slate-900/75">
          <div className="hm-flex hm-items-center hm-gap-2 hm-border-b hm-border-slate-200/80 hm-px-4 hm-py-3 dark:hm-border-slate-800">
            <span className="hm-h-3 hm-w-3 hm-rounded-full hm-bg-rose-400" />
            <span className="hm-h-3 hm-w-3 hm-rounded-full hm-bg-amber-400" />
            <span className="hm-h-3 hm-w-3 hm-rounded-full hm-bg-emerald-400" />
            <span className="hm-ml-3 hm-text-xs hm-font-medium hm-text-slate-500 dark:hm-text-slate-400">
              Live editor demo
            </span>
          </div>
          <div className="hm-h-[400px] hm-overflow-y-auto hm-p-4 md:hm-p-6">
            <HybricEditor
              content={heroContent}
              className="hm-prose hm-max-w-none dark:hm-prose-invert"
            />
          </div>
        </div>

        <div className="hm-mt-6 hm-max-w-4xl hm-mx-auto hm-rounded-xl hm-border hm-border-slate-200 hm-bg-slate-950 hm-px-4 hm-py-3 hm-shadow-lg dark:hm-border-slate-700">
          <code className="hm-text-sm hm-text-slate-100">{installCommand}</code>
        </div>
      </section>

      <section className="hm-relative hm-w-full hm-max-w-7xl hm-mx-auto hm-px-6 hm-py-10">
        <div className="hm-mb-6">
          <h2 className="hm-text-3xl hm-font-semibold hm-tracking-tight">Why editor teams pick HybricMark</h2>
          <p className="hm-mt-2 hm-text-slate-600 dark:hm-text-slate-300">
            Purpose-built for products that need block-level data and customizable editing UX.
          </p>
        </div>
        <div className="hm-grid hm-grid-cols-1 md:hm-grid-cols-2 xl:hm-grid-cols-3 hm-gap-5">
          {features.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="hm-group hm-rounded-2xl hm-border hm-border-slate-200 hm-bg-white/70 hm-p-6 hm-shadow-sm hm-transition hover:hm--translate-y-1 hover:hm-shadow-lg dark:hm-border-slate-800 dark:hm-bg-slate-900/70"
              >
                <div className="hm-inline-flex hm-h-10 hm-w-10 hm-items-center hm-justify-center hm-rounded-lg hm-bg-blue-50 hm-text-blue-700 dark:hm-bg-blue-500/15 dark:hm-text-blue-300">
                  <Icon className="hm-h-5 hm-w-5" />
                </div>
                <h3 className="hm-mt-4 hm-text-lg hm-font-semibold hm-tracking-tight">
                  {item.title}
                </h3>
                <p className="hm-mt-2 hm-text-sm hm-leading-6 hm-text-slate-600 dark:hm-text-slate-300">
                  {item.desc}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="hm-relative hm-w-full hm-max-w-7xl hm-mx-auto hm-px-6 hm-py-10">
        <div className="hm-grid hm-grid-cols-1 lg:hm-grid-cols-2 hm-gap-8 hm-items-stretch">
          <div className="hm-rounded-2xl hm-border hm-border-slate-200 hm-bg-slate-950 hm-p-6 hm-shadow-xl dark:hm-border-slate-800">
            <div className="hm-text-xs hm-font-semibold hm-tracking-[0.14em] hm-uppercase hm-text-slate-400">
              Quick Start
            </div>
            <pre className="hm-mt-4 hm-overflow-x-auto hm-text-sm hm-leading-7 hm-text-slate-100">
              <code>{snippet}</code>
            </pre>
          </div>

          <div className="hm-rounded-2xl hm-border hm-border-slate-200 hm-bg-white/70 hm-p-6 hm-shadow-sm dark:hm-border-slate-800 dark:hm-bg-slate-900/70">
            <div className="hm-text-xs hm-font-semibold hm-tracking-[0.14em] hm-uppercase hm-text-slate-500 dark:hm-text-slate-400">
              Block Data Model
            </div>
            <pre className="hm-mt-4 hm-overflow-x-auto hm-text-xs hm-leading-6 hm-text-slate-700 dark:hm-text-slate-200">
              <code>{dataSnippet}</code>
            </pre>
            <p className="hm-mt-4 hm-text-sm hm-leading-6 hm-text-slate-600 dark:hm-text-slate-300">
              UUID-backed blocks make granular database updates and block-level references straightforward.
            </p>
          </div>
        </div>
      </section>

      <section className="hm-relative hm-w-full hm-max-w-7xl hm-mx-auto hm-px-6 hm-pt-8 hm-pb-24">
        <div className="hm-rounded-3xl hm-border hm-border-slate-200 hm-bg-white/70 hm-p-10 md:hm-p-14 hm-shadow-lg dark:hm-border-slate-800 dark:hm-bg-slate-900/70">
          <p className="hm-text-4xl md:hm-text-5xl hm-font-bold hm-tracking-tight">
            Ready to build?
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="hm-mt-8 hm-inline-flex hm-items-center hm-gap-3 hm-rounded-xl hm-border hm-border-slate-300 hm-bg-slate-100 hm-px-5 hm-py-3 hm-font-semibold hm-text-slate-800 hm-transition hover:hm-bg-slate-200 dark:hm-border-slate-700 dark:hm-bg-slate-800 dark:hm-text-slate-100 dark:hover:hm-bg-slate-700"
          >
            {copied ? 'Copied!' : installCmd}
          </button>
        </div>
      </section>
    </main>
  )
}
