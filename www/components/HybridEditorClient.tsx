import { useEffect, useState } from 'react'
import { HybricEditor, type HybricEditorProps } from '../../src/lib/components/HybricEditor'

export function HybridEditorClient(props: HybricEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="hm-editor-loading" data-loading="true">
        <div className="hm-editor-loading-line hm-editor-loading-line-lg" />
        <div className="hm-editor-loading-line" />
        <div className="hm-editor-loading-line" />
      </div>
    )
  }

  return <HybricEditor {...props} />
}
