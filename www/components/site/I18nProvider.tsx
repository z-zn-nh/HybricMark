/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Language = 'en' | 'zh'

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (en: string, zh: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)
const STORAGE_KEY = 'hybricmark-doc-lang'

const UI_TEXT = {
  'On This Page': { en: 'On This Page', zh: '本页目录' },
  'Scroll to top': { en: 'Scroll to top', zh: '返回顶部' },
  System: { en: 'System', zh: '跟随系统' },
  Light: { en: 'Light', zh: '浅色' },
  Dark: { en: 'Dark', zh: '深色' },
  Docs: { en: 'Docs', zh: '文档' },
  Overview: { en: 'Overview', zh: '概览' },
  'Getting Started': { en: 'Getting Started', zh: '快速开始' },
  'API Reference': { en: 'API Reference', zh: 'API 参考' },
  Concepts: { en: 'Concepts', zh: '核心概念' },
  'Block Identity': { en: 'Block Identity', zh: '块级身份' },
  'Headless Design': { en: 'Headless Design', zh: '无头设计' },
  Guides: { en: 'Guides', zh: '指南' },
  'Saving to Database': { en: 'Saving to Database', zh: '保存到数据库' },
  'Custom Styling': { en: 'Custom Styling', zh: '自定义样式' },
  'Handling Image Uploads': { en: 'Handling Image Uploads', zh: '处理图片上传' },
  'Table Workflows': { en: 'Table Workflows', zh: '表格工作流' },
  'Link Interaction': { en: 'Link Interaction', zh: '链接交互' },
  'Keyboard Shortcuts': { en: 'Keyboard Shortcuts', zh: '快捷键系统' },
  'Footnotes & Math': { en: 'Footnotes & Math', zh: '注脚与数学公式' },
  'Custom Slash Menu': { en: 'Custom Slash Menu', zh: '自定义斜杠菜单' },
  'Next.js / SSR': { en: 'Next.js / SSR', zh: 'Next.js / SSR' },
  'Security Hardening': { en: 'Security Hardening', zh: '安全加固' },
  Troubleshooting: { en: 'Troubleshooting', zh: '故障排查' },
  Extensions: { en: 'Extensions', zh: '扩展列表' },
  'Capabilities & Limits': { en: 'Capabilities & Limits', zh: '能力与限制' },
  FAQ: { en: 'FAQ', zh: '常见问题' },
  Playground: { en: 'Playground', zh: '演练场' },
} as const

const SEARCH_PLACEHOLDER = {
  en: ['Search documentation...', 'Search documentation…'],
  zh: ['搜索文档...', '搜索文档…'],
} as const

const LAST_UPDATED_PREFIX = {
  en: 'Last updated on',
  zh: '最后更新于',
} as const

function patchNextraUi(language: Language) {
  if (typeof document === 'undefined') {
    return
  }

  const opposite: Language = language === 'zh' ? 'en' : 'zh'
  const labels = Object.values(UI_TEXT)
  const allElements = document.querySelectorAll<HTMLElement>('body *')

  for (const el of allElements) {
    const textNodes = Array.from(el.childNodes).filter(
      (node): node is Text => node.nodeType === Node.TEXT_NODE && Boolean(node.nodeValue?.trim()),
    )

    for (const node of textNodes) {
      const currentRaw = node.nodeValue ?? ''
      const trimmed = currentRaw.trim()

      for (const label of labels) {
        const from = label[opposite]
        const to = label[language]

        if (trimmed === from && from !== to) {
          node.nodeValue = currentRaw.replace(trimmed, to)
          break
        }

        const mixedA = `${label.en} / ${label.zh}`
        const mixedB = `${label.zh} / ${label.en}`
        if (trimmed === mixedA || trimmed === mixedB) {
          node.nodeValue = currentRaw.replace(trimmed, to)
          break
        }
      }

      const fromPrefix = LAST_UPDATED_PREFIX[opposite]
      const toPrefix = LAST_UPDATED_PREFIX[language]
      if ((node.nodeValue ?? '').includes(fromPrefix)) {
        node.nodeValue = (node.nodeValue ?? '').replace(fromPrefix, toPrefix)
      }
    }
  }

  const searchInput = document.querySelector<HTMLInputElement>('input[placeholder]')
  if (searchInput) {
    const current = searchInput.getAttribute('placeholder') ?? ''
    const allCandidates: string[] = [...SEARCH_PLACEHOLDER.en, ...SEARCH_PLACEHOLDER.zh]
    if (allCandidates.includes(current)) {
      const useEllipsis = current.includes('…')
      const next = useEllipsis ? SEARCH_PLACEHOLDER[language][1] : SEARCH_PLACEHOLDER[language][0]
      if (next !== current) {
        searchInput.setAttribute('placeholder', next)
      }
    }
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en'
    }

    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'zh' || stored === 'en' ? stored : 'en'
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    document.documentElement.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en')
    document.documentElement.setAttribute('data-doc-lang', language)
    patchNextraUi(language)

    const handleExternalLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<Language>).detail
      if (next === 'zh' || next === 'en') {
        setLanguageState(next)
        patchNextraUi(next)
      }
    }

    window.addEventListener('hm-language-change', handleExternalLanguageChange as EventListener)

    let patching = false
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-doc-lang')
      if ((current === 'zh' || current === 'en') && !patching) {
        patching = true
        patchNextraUi(current)
        queueMicrotask(() => {
          patching = false
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('hm-language-change', handleExternalLanguageChange as EventListener)
      observer.disconnect()
    }
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en')
      document.documentElement.setAttribute('data-doc-lang', lang)
      patchNextraUi(lang)
      window.dispatchEvent(new CustomEvent('hm-language-change', { detail: lang }))
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }, [language, setLanguage])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (en, zh) => (language === 'zh' ? zh : en),
    }),
    [language, setLanguage, toggleLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function I18nText({ en, zh }: { en: string; zh: string }) {
  const { t } = useI18n()
  return <>{t(en, zh)}</>
}
