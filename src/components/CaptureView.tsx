import { useRef, useState } from 'react'
import { extractCardFields } from '../gemini'
import type { ParsedFields } from '../types'
import AiSparkle from './AiSparkle'

interface Props {
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

export default function CaptureView({ onScanned, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorText('')
    const dataUrl = await fileToDataUrl(file)
    setPreview(dataUrl)
  }

  async function handleScan() {
    if (!preview) return
    setBusy(true)
    setErrorText('')
    try {
      const fields = await extractCardFields(preview)
      onScanned(fields, preview)
    } catch (err) {
      console.error(err)
      setErrorText(
        err instanceof Error ? err.message : 'Could not read the card. Try another photo.',
      )
      setBusy(false)
    }
  }

  return (
    <div className="view">
      <header className="topbar">
        <button className="link" onClick={onCancel} disabled={busy}>
          ‹ Back
        </button>
        <h1>Scan card</h1>
        <span />
      </header>

      <div className="capture-body">
        {preview ? (
          <img className="preview" src={preview} alt="Card preview" />
        ) : (
          <div className="placeholder">
            <p>Take a photo of the business card</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleFile}
        />

        {busy ? (
          <AiSparkle />
        ) : (
          <div className="actions">
            <button className="btn" onClick={() => inputRef.current?.click()}>
              {preview ? 'Retake photo' : '📷 Open camera'}
            </button>
            {preview && (
              <button className="btn primary" onClick={handleScan}>
                Scan card
              </button>
            )}
            {errorText && <p className="error">{errorText}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
