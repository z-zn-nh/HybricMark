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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') {
      setLanguageState(stored)
      document.documentElement.setAttribute('lang', stored === 'zh' ? 'zh-CN' : 'en')
      document.documentElement.setAttribute('data-doc-lang', stored)
    } else {
      document.documentElement.setAttribute('lang', 'en')
      document.documentElement.setAttribute('data-doc-lang', 'en')
    }

    const handleExternalLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>
      const next = customEvent.detail
      if (next === 'zh' || next === 'en') {
        setLanguageState(next)
      }
    }

    window.addEventListener('hm-language-change', handleExternalLanguageChange as EventListener)

    return () => {
      window.removeEventListener('hm-language-change', handleExternalLanguageChange as EventListener)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en')
      document.documentElement.setAttribute('data-doc-lang', lang)
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
