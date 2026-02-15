import { Github, Languages, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type Language = 'en' | 'zh'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  window.localStorage.setItem('theme', theme)
  window.dispatchEvent(new CustomEvent('hm-theme-change', { detail: theme }))
}

function applyLanguage(language: Language) {
  document.documentElement.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en')
  document.documentElement.setAttribute('data-doc-lang', language)
  window.localStorage.setItem('hybricmark-doc-lang', language)
  window.dispatchEvent(new CustomEvent('hm-language-change', { detail: language }))
}

export function TopRightControls() {
  const [theme, setTheme] = useState<Theme>('light')
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedTheme = window.localStorage.getItem('theme')
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme)
      applyTheme(storedTheme)
    } else {
      const preferDark =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      const nextTheme = preferDark ? 'dark' : 'light'
      setTheme(nextTheme)
      applyTheme(nextTheme)
    }

    const storedLang = window.localStorage.getItem('hybricmark-doc-lang')
    if (storedLang === 'zh' || storedLang === 'en') {
      setLanguage(storedLang)
      applyLanguage(storedLang)
    } else {
      applyLanguage('en')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'zh' : 'en'
    setLanguage(next)
    applyLanguage(next)
  }

  return (
    <div className="hm-site-controls" aria-label="site-controls">
      <a
        href="https://github.com/z-zn-nh/HybricMark"
        target="_blank"
        rel="noreferrer"
        className="hm-site-control-btn"
        title="GitHub"
      >
        <Github size={16} />
      </a>

      <button
        type="button"
        className="hm-site-control-btn"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <button
        type="button"
        className="hm-site-control-btn hm-site-control-lang"
        onClick={toggleLanguage}
        title={language === 'zh' ? 'Switch to English' : '切换到中文'}
      >
        <Languages size={16} />
        <span>{language === 'zh' ? '中文' : 'EN'}</span>
      </button>
    </div>
  )
}
