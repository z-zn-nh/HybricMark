import type { DocsThemeConfig } from 'nextra-theme-docs'
import { TopRightControls } from './components/site/TopRightControls'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>HybricMark</span>,
  docsRepositoryBase: 'https://github.com/z-zn-nh/HybricMark/tree/main/www',
  feedback: {
    content: null
  },
  editLink: {
    content: null
  },
  navbar: {
    extraContent: <TopRightControls />
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
