import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700 }}>HybricMark</span>,
  project: {
    link: 'https://github.com/your-username/hybricmark'
  },
  footer: {
    content: 'MIT License (c) 2024 HybricMark'
  },
  head: () => (
    <>
      <meta name="title" content="HybricMark Documentation" />
      <meta
        name="description"
        content="HybricMark is a headless, Typora-like Markdown editor for React, built on Tiptap."
      />
      <meta property="og:title" content="HybricMark Documentation" />
      <meta
        property="og:description"
        content="Headless hybrid Markdown editing for React with block IDs and Typora-like UX."
      />
    </>
  )
}

export default config
