import dns from 'dns/promises'
import { COMMUNITY_IMAGE_ALLOWED_TYPES, COMMUNITY_IMAGE_MAX_SIZE } from '@/lib/types/communities'

export class ImageFetchError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'ImageFetchError'
  }
}

export interface FetchedImage {
  buffer: Buffer
  mime: string
  ext: string
}

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fe[89ab][0-9a-f]:/i,
  /^0\.0\.0\.0/,
]

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const TIMEOUT_MS = 10_000

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((re) => re.test(ip))
}

export async function fetchExternalImage(rawUrl: string): Promise<FetchedImage> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new ImageFetchError('URL inválida', 'IMAGE_INVALID_URL')
  }

  if (url.protocol !== 'https:') {
    throw new ImageFetchError('Solo se permiten URLs https', 'IMAGE_BLOCKED_HOST')
  }

  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    throw new ImageFetchError('Host no permitido', 'IMAGE_BLOCKED_HOST')
  }

  try {
    const { address } = await dns.lookup(hostname)
    if (isPrivateIp(address)) {
      throw new ImageFetchError('Host no permitido', 'IMAGE_BLOCKED_HOST')
    }
  } catch (err) {
    if (err instanceof ImageFetchError) throw err
    throw new ImageFetchError('No se pudo resolver el host', 'IMAGE_FETCH_FAILED')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: 'error',
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ImageFetchError('Timeout al descargar la imagen', 'IMAGE_FETCH_FAILED')
    }
    throw new ImageFetchError('Error al descargar la imagen', 'IMAGE_FETCH_FAILED')
  }
  clearTimeout(timeoutId)

  if (!response.ok) {
    throw new ImageFetchError('Error al descargar la imagen', 'IMAGE_FETCH_FAILED')
  }

  const rawContentType = response.headers.get('content-type') ?? ''
  const mime = rawContentType.split(';')[0].trim()

  if (!COMMUNITY_IMAGE_ALLOWED_TYPES.includes(mime as typeof COMMUNITY_IMAGE_ALLOWED_TYPES[number])) {
    throw new ImageFetchError('Tipo de imagen no válido. Usa JPG, PNG o WebP', 'IMAGE_INVALID_TYPE')
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new ImageFetchError('Error al leer la imagen', 'IMAGE_FETCH_FAILED')
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      totalBytes += value.byteLength
      if (totalBytes > COMMUNITY_IMAGE_MAX_SIZE) {
        await reader.cancel()
        throw new ImageFetchError('La imagen supera el tamaño máximo de 5MB', 'IMAGE_TOO_LARGE')
      }
      chunks.push(value)
    }
  }

  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)))
  const ext = MIME_TO_EXT[mime] ?? 'jpg'

  return { buffer, mime, ext }
}
