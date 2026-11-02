import type { ImageMediaType } from '../../shared/protocol.ts'

export type Attachment = {
  mediaType: ImageMediaType
  /** Base64 JPEG without the data: prefix, sent to Claude. */
  data: string
  /** Small data URL for showing on screen. */
  preview: string
}

// Claude reads images up to about this size on the long edge; bigger only costs more.
const MAX_EDGE = 1568
const PREVIEW_EDGE = 640

function draw(bitmap: ImageBitmap, edge: number, quality: number): string {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

/** Shrinks a photo from the camera or disk to a size Claude reads well, as JPEG. */
export async function prepareImage(file: Blob): Promise<Attachment> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('That image format is not supported. Try a JPEG or PNG.')
  }
  try {
    const full = draw(bitmap, MAX_EDGE, 0.85)
    const preview = draw(bitmap, PREVIEW_EDGE, 0.72)
    return { mediaType: 'image/jpeg', data: full.slice(full.indexOf(',') + 1), preview }
  } finally {
    bitmap.close()
  }
}
