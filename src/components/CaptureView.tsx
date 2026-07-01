import { useEffect, useRef, useState } from 'react'
import { extractCardFields } from '../gemini'
import type { ParsedFields } from '../types'
import AiSparkle from './AiSparkle'

interface Props {
  initialImage: string
  onScanned: (fields: ParsedFields, imageDataUrl: string) => void
  onCancel: () => void
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CaptureView({ initialImage, onScanned, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const started = useRef(false)
  const [image, setImage] = useState(initialImage)
  const [busy, setBusy] = useState(true)
  const [errorText, setErrorText] = useState('')

  // Analyze straight away once the photo arrives (skip a preview step — iOS's
  // camera already offers Use Photo / Retake). Guarded against StrictMode's
  // double-invoke.
  useEffect(() => {
    if (started.current) return
    started.current = true
    scan(initialImage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function scan(src: string) {
    setImage(src)
    setBusy(true)
    setErrorText('')
    try {
      const fields = await extractCardFields(src)
      onScanned(fields, src)
    } catch (err) {
      console.error(err)
      setErrorText(
        err instanceof Error ? err.message : 'Could not read the card. Try another photo.',
      )
      setBusy(false)
    }
  }

  async function handleRetake(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    scan(await fileToDataUrl(file))
  }

  return (
    <div className="view">
      <header className="topbar">
        <button className="link" onClick={onCancel} disabled={busy}>
          ‹ Back
        </button>
        <h1>{busy ? 'Analyzing…' : 'Scan card'}</h1>
        <span />
      </header>

      <div className="capture-body">
        <img className="preview" src={image} alt="Scanned card" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleRetake}
        />

        {busy ? (
          <AiSparkle />
        ) : (
          <div className="actions">
            <button className="btn primary" onClick={() => scan(image)}>
              Try again
            </button>
            <button className="btn" onClick={() => inputRef.current?.click()}>
              Retake photo
            </button>
            {errorText && <p className="error">{errorText}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
