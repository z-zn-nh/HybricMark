import dynamic from 'next/dynamic'
import type { HybricEditorProps } from '../../src/lib/components/HybricEditor'

const HybricEditor = dynamic(
  () => import('../../src/lib/components/HybricEditor').then((mod) => mod.HybricEditor),
  {
    ssr: false,
    loading: () => (
      <div className="hm-editor-loading" data-loading="true">
        <div className="hm-editor-loading-line hm-editor-loading-line-lg" />
        <div className="hm-editor-loading-line" />
        <div className="hm-editor-loading-line" />
      </div>
    ),
  },
)

export function HybridEditorClient(props: HybricEditorProps) {
  return <HybricEditor {...props} />
}
