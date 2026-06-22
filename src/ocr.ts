import Tesseract from 'tesseract.js'

export type OcrProgress = (status: string, progress: number) => void

/**
 * Run OCR on an image (File or data URL) and return the raw recognized text.
 * Uses tesseract.js entirely in the browser — no server involved.
 */
export async function runOcr(
  image: File | string,
  onProgress?: OcrProgress,
): Promise<string> {
  const result = await Tesseract.recognize(image, 'eng', {
    logger: (m) => {
      if (onProgress && typeof m.progress === 'number') {
        onProgress(m.status, m.progress)
      }
    },
  })
  return result.data.text
}
