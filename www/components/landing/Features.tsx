function FeatureIcon({ label }: { label: string }) {
  return <span className="hmk-feature-icon" aria-hidden>{label}</span>
}

export function Features() {
  return (
    <section className="hmk-landing-shell hmk-features-root">
      <div className="hmk-section-head">
        <p className="hmk-eyebrow">WHY HYBRICMARK</p>
        <h2 className="hmk-section-title">Built for modern block-based products</h2>
      </div>

      <div className="hmk-bento-grid">
        <article className="hmk-feature-card">
          <FeatureIcon label="ID" />
          <h3>Block Identity Engine</h3>
          <p>
            Every paragraph and list item can own a unique ID. Perfect for backlinks, comments, and card extraction workflows.
          </p>
        </article>

        <article className="hmk-feature-card">
          <FeatureIcon label="/" />
          <h3>Slash Command UX</h3>
          <p>
            Context-aware commands keep users in flow. Trigger rich formatting and block insertion without noisy toolbars.
          </p>
        </article>

        <article className="hmk-feature-card">
          <FeatureIcon label="{}" />
          <h3>Headless + Tailwind</h3>
          <p>
            Keep full control over rendering and interaction. Style every state with your own design system in plain React.
          </p>
        </article>
      </div>
    </section>
  )
}
