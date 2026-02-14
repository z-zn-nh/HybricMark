import dynamic from 'next/dynamic'

const HybricEditor = dynamic(
  () => import('hybricmark').then((mod) => mod.HybricEditor),
  {
    ssr: false,
    loading: () => (
      <div className="hmk-editor-skeleton">
        <div className="hmk-editor-skeleton-line hmk-editor-skeleton-line-lg" />
        <div className="hmk-editor-skeleton-line" />
        <div className="hmk-editor-skeleton-line" />
      </div>
    )
  }
)

const HERO_CONTENT = `# HybricMark Playground\n\nStart typing instantly.\n\n- Slash commands\n- Block IDs\n- Typora-like interaction\n\nTry **bold**, _italic_, and [links](https://github.com/z-zn-nh/HybricMark).`

export function Hero() {
  return (
    <section className="hmk-landing-shell hmk-hero-root">
      <div className="hmk-hero-bg" aria-hidden />

      <div className="hmk-hero-header">
        <p className="hmk-eyebrow">HYBRICMARK</p>
        <h1 className="hmk-hero-title">The Editor You&apos;ve Been Dreaming Of</h1>
        <p className="hmk-hero-subtitle">
          Headless. Block-based. Typora-like. Build production writing experiences without fighting your editor stack.
        </p>

        <div className="hmk-hero-actions">
          <a href="/docs/getting-started" className="hmk-btn hmk-btn-primary">
            Get Started
          </a>
          <a
            href="https://github.com/z-zn-nh/HybricMark"
            target="_blank"
            rel="noreferrer"
            className="hmk-btn hmk-btn-secondary"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="glass-panel hmk-browser-frame">
        <div className="hmk-browser-topbar">
          <div className="hmk-browser-dots">
            <span className="hmk-dot hmk-dot-red" />
            <span className="hmk-dot hmk-dot-yellow" />
            <span className="hmk-dot hmk-dot-green" />
          </div>
          <span className="hmk-browser-url">https://txlan.top/playground</span>
        </div>

        <div className="hmk-browser-body">
          <HybricEditor content={HERO_CONTENT} editable />
        </div>
      </div>
    </section>
  )
}
