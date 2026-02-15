import { Github, Languages, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type Language = 'en' | 'zh'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem('theme')
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  const preferDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return preferDark ? 'dark' : 'light'
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const storedLang = window.localStorage.getItem('hybricmark-doc-lang')
  return storedLang === 'zh' || storedLang === 'en' ? storedLang : 'en'
}

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
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const nextLanguage: Language = language === 'en' ? 'zh' : 'en'

  useEffect(() => {
    if (typeof window === 'undefined') return
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    applyLanguage(language)
  }, [language])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'))
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
        title={nextLanguage === 'zh' ? '切换到中文' : 'Switch to English'}
      >
        <Languages size={16} />
        <span>{nextLanguage === 'zh' ? '中文' : 'EN'}</span>
      </button>
    </div>
  )
}
