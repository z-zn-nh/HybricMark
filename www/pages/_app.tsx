import 'nextra-theme-docs/style.css'
import '../../src/lib/styles/editor.css'
import 'katex/dist/katex.min.css'
import '../styles.css'
import type { AppProps } from 'next/app'
import { I18nProvider } from '../components/site/I18nProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider>
      <Component {...pageProps} />
    </I18nProvider>
  )
}
