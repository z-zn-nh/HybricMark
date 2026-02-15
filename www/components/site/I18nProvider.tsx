import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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
  tocTitle: { en: 'On This Page', zh: '本页目录' },
  scrollTop: { en: 'Scroll to top', zh: '返回顶部' },
  system: { en: 'System', zh: '跟随系统' },
  light: { en: 'Light', zh: '浅色' },
  dark: { en: 'Dark', zh: '深色' },
  searchPlaceholder: { en: 'Search documentation...', zh: '搜索文档...' },
  searchPlaceholderAlt: { en: 'Search documentation…', zh: '搜索文档…' },
  lastUpdatedPrefix: { en: 'Last updated on', zh: '最后更新于' },
} as const

const EXACT_TEXT_KEYS = [
  'tocTitle',
  'scrollTop',
  'system',
  'light',
  'dark',
] as const

function patchNextraUi(language: Language) {
  if (typeof document === 'undefined') return

  const to = (key: (typeof EXACT_TEXT_KEYS)[number]) => UI_TEXT[key][language]
  const opposite = language === 'zh' ? 'en' : 'zh'

  const allElements = document.querySelectorAll<HTMLElement>('body *')
  for (const el of allElements) {
    if (el.children.length > 0) continue
    const raw = el.textContent
    if (!raw) continue
    const text = raw.trim()
    if (!text) continue

    for (const key of EXACT_TEXT_KEYS) {
      const fromA = UI_TEXT[key].en
      const fromB = UI_TEXT[key].zh
      if ((text === fromA || text === fromB) && text !== to(key)) {
        el.textContent = to(key)
        break
      }
    }

    const lastUpdatedFrom = UI_TEXT.lastUpdatedPrefix[opposite]
    const lastUpdatedTo = UI_TEXT.lastUpdatedPrefix[language]
    if (el.textContent?.includes(lastUpdatedFrom)) {
      const next = el.textContent.replace(lastUpdatedFrom, lastUpdatedTo)
      if (next !== el.textContent) {
        el.textContent = next
      }
    } else if (el.textContent?.includes(UI_TEXT.lastUpdatedPrefix.en) && language === 'zh') {
      const next = el.textContent.replace(UI_TEXT.lastUpdatedPrefix.en, UI_TEXT.lastUpdatedPrefix.zh)
      if (next !== el.textContent) {
        el.textContent = next
      }
    } else if (el.textContent?.includes(UI_TEXT.lastUpdatedPrefix.zh) && language === 'en') {
      const next = el.textContent.replace(UI_TEXT.lastUpdatedPrefix.zh, UI_TEXT.lastUpdatedPrefix.en)
      if (next !== el.textContent) {
        el.textContent = next
      }
    }
  }

  const searchInput = document.querySelector<HTMLInputElement>('input[placeholder]')
  if (searchInput) {
    const p = searchInput.getAttribute('placeholder') ?? ''
    if (
      p === UI_TEXT.searchPlaceholder.en ||
      p === UI_TEXT.searchPlaceholder.zh ||
      p === UI_TEXT.searchPlaceholderAlt.en ||
      p === UI_TEXT.searchPlaceholderAlt.zh
    ) {
      const nextPlaceholder =
        p.includes('…') ? UI_TEXT.searchPlaceholderAlt[language] : UI_TEXT.searchPlaceholder[language]
      if (p !== nextPlaceholder) {
        searchInput.setAttribute('placeholder', nextPlaceholder)
      }
    }
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') {
      setLanguageState(stored)
      document.documentElement.setAttribute('lang', stored === 'zh' ? 'zh-CN' : 'en')
      document.documentElement.setAttribute('data-doc-lang', stored)
      patchNextraUi(stored)
    } else {
      document.documentElement.setAttribute('lang', 'en')
      document.documentElement.setAttribute('data-doc-lang', 'en')
      patchNextraUi('en')
    }

    const handleExternalLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>
      const next = customEvent.detail
      if (next === 'zh' || next === 'en') {
        setLanguageState(next)
        patchNextraUi(next)
      }
    }

    window.addEventListener('hm-language-change', handleExternalLanguageChange as EventListener)

    let isPatching = false
    const safelyPatch = (lang: Language) => {
      if (isPatching) return
      isPatching = true
      patchNextraUi(lang)
      queueMicrotask(() => {
        isPatching = false
      })
    }

    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-doc-lang')
      if (current === 'zh' || current === 'en') {
        safelyPatch(current)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('hm-language-change', handleExternalLanguageChange as EventListener)
      observer.disconnect()
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en')
      document.documentElement.setAttribute('data-doc-lang', lang)
      patchNextraUi(lang)
      window.dispatchEvent(new CustomEvent('hm-language-change', { detail: lang }))
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (en, zh) => (language === 'zh' ? zh : en),
    }),
    [language],
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
