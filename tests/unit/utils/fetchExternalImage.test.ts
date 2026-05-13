import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de dns/promises
// ---------------------------------------------------------------------------

vi.mock('dns/promises', () => ({
  default: { lookup: vi.fn() },
  lookup: vi.fn(),
}))

import dns from 'dns/promises'

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import { fetchExternalImage, ImageFetchError } from '@/lib/utils/fetchExternalImage'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildResponse(options: {
  ok?: boolean
  status?: number
  contentType?: string
  body?: string | Uint8Array
}): Response {
  const {
    ok = true,
    status = 200,
    contentType = 'image/jpeg',
    body = 'fake-image-data',
  } = options

  const encoder = new TextEncoder()
  const bytes = typeof body === 'string' ? encoder.encode(body) : body
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })

  return new Response(stream, {
    status,
    headers: { 'content-type': contentType },
  }) as Response & { ok: boolean }
}

const MOCK_EXTERNAL_URL = 'https://example.com/image.jpg'
const MOCK_PUBLIC_IP = '93.184.216.34'

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('fetchExternalImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dns.lookup).mockResolvedValue({ address: MOCK_PUBLIC_IP, family: 4 })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('validación de protocolo', () => {
    it('lanza IMAGE_BLOCKED_HOST para URLs http://', async () => {
      await expect(
        fetchExternalImage('http://example.com/image.jpg')
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_BLOCKED_HOST para URLs ftp://', async () => {
      await expect(
        fetchExternalImage('ftp://example.com/image.jpg')
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_INVALID_URL para texto que no es URL', async () => {
      await expect(
        fetchExternalImage('not-a-url')
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_INVALID_URL' }))
    })
  })

  describe('bloqueo de hosts privados', () => {
    it('lanza IMAGE_BLOCKED_HOST para localhost', async () => {
      await expect(
        fetchExternalImage('https://localhost/image.jpg')
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_BLOCKED_HOST para 0.0.0.0', async () => {
      await expect(
        fetchExternalImage('https://0.0.0.0/image.jpg')
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_BLOCKED_HOST para IPs loopback (127.x.x.x)', async () => {
      vi.mocked(dns.lookup).mockResolvedValue({ address: '127.0.0.1', family: 4 })
      await expect(
        fetchExternalImage('https://internal.example.com/image.jpg')
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_BLOCKED_HOST para IPs privadas clase A (10.x.x.x)', async () => {
      vi.mocked(dns.lookup).mockResolvedValue({ address: '10.0.0.1', family: 4 })
      await expect(
        fetchExternalImage(MOCK_EXTERNAL_URL)
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_BLOCKED_HOST para IPs privadas clase B (172.16-31.x.x)', async () => {
      vi.mocked(dns.lookup).mockResolvedValue({ address: '172.16.0.1', family: 4 })
      await expect(
        fetchExternalImage(MOCK_EXTERNAL_URL)
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_BLOCKED_HOST para IPs privadas clase C (192.168.x.x)', async () => {
      vi.mocked(dns.lookup).mockResolvedValue({ address: '192.168.1.1', family: 4 })
      await expect(
        fetchExternalImage(MOCK_EXTERNAL_URL)
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_BLOCKED_HOST para link-local (169.254.x.x)', async () => {
      vi.mocked(dns.lookup).mockResolvedValue({ address: '169.254.169.254', family: 4 })
      await expect(
        fetchExternalImage(MOCK_EXTERNAL_URL)
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_BLOCKED_HOST' }))
    })

    it('lanza IMAGE_FETCH_FAILED cuando el DNS no puede resolver el host', async () => {
      vi.mocked(dns.lookup).mockRejectedValue(new Error('ENOTFOUND'))
      await expect(
        fetchExternalImage(MOCK_EXTERNAL_URL)
      ).rejects.toThrow(expect.objectContaining({ code: 'IMAGE_FETCH_FAILED' }))
    })
  })

  describe('validación de Content-Type', () => {
    it('lanza IMAGE_INVALID_TYPE para text/html', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ contentType: 'text/html' })
      )
      await expect(fetchExternalImage(MOCK_EXTERNAL_URL)).rejects.toThrow(
        expect.objectContaining({ code: 'IMAGE_INVALID_TYPE' })
      )
    })

    it('lanza IMAGE_INVALID_TYPE para application/zip', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ contentType: 'application/zip' })
      )
      await expect(fetchExternalImage(MOCK_EXTERNAL_URL)).rejects.toThrow(
        expect.objectContaining({ code: 'IMAGE_INVALID_TYPE' })
      )
    })

    it('acepta image/jpeg', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ contentType: 'image/jpeg' })
      )
      const result = await fetchExternalImage(MOCK_EXTERNAL_URL)
      expect(result.mime).toBe('image/jpeg')
      expect(result.ext).toBe('jpg')
    })

    it('acepta image/png', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ contentType: 'image/png' })
      )
      const result = await fetchExternalImage(MOCK_EXTERNAL_URL)
      expect(result.mime).toBe('image/png')
      expect(result.ext).toBe('png')
    })

    it('acepta image/webp', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ contentType: 'image/webp' })
      )
      const result = await fetchExternalImage(MOCK_EXTERNAL_URL)
      expect(result.mime).toBe('image/webp')
      expect(result.ext).toBe('webp')
    })

    it('ignora los parámetros del Content-Type (ej: charset=utf-8)', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ contentType: 'image/jpeg; charset=utf-8' })
      )
      const result = await fetchExternalImage(MOCK_EXTERNAL_URL)
      expect(result.mime).toBe('image/jpeg')
    })
  })

  describe('límite de tamaño', () => {
    it('lanza IMAGE_TOO_LARGE cuando la respuesta supera 5MB', async () => {
      const bigChunk = new Uint8Array(5 * 1024 * 1024 + 1)
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ body: bigChunk })
      )
      await expect(fetchExternalImage(MOCK_EXTERNAL_URL)).rejects.toThrow(
        expect.objectContaining({ code: 'IMAGE_TOO_LARGE' })
      )
    })

    it('acepta una imagen de exactamente 1MB', async () => {
      const chunk = new Uint8Array(1 * 1024 * 1024)
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ body: chunk })
      )
      const result = await fetchExternalImage(MOCK_EXTERNAL_URL)
      expect(result.buffer.byteLength).toBe(1 * 1024 * 1024)
    })
  })

  describe('respuesta HTTP no exitosa', () => {
    it('lanza IMAGE_FETCH_FAILED para 404', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ ok: false, status: 404 })
      )
      await expect(fetchExternalImage(MOCK_EXTERNAL_URL)).rejects.toThrow(
        expect.objectContaining({ code: 'IMAGE_FETCH_FAILED' })
      )
    })

    it('lanza IMAGE_FETCH_FAILED para 500', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ ok: false, status: 500 })
      )
      await expect(fetchExternalImage(MOCK_EXTERNAL_URL)).rejects.toThrow(
        expect.objectContaining({ code: 'IMAGE_FETCH_FAILED' })
      )
    })
  })

  describe('happy path', () => {
    it('retorna buffer, mime y ext para una imagen JPEG válida de un host público', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        buildResponse({ contentType: 'image/jpeg', body: 'fake-jpeg' })
      )
      const result = await fetchExternalImage(MOCK_EXTERNAL_URL)
      expect(result.mime).toBe('image/jpeg')
      expect(result.ext).toBe('jpg')
      expect(result.buffer).toBeInstanceOf(Buffer)
      expect(result.buffer.byteLength).toBeGreaterThan(0)
    })
  })

  describe('ImageFetchError', () => {
    it('tiene nombre ImageFetchError y propiedad code', () => {
      const err = new ImageFetchError('test', 'TEST_CODE')
      expect(err.name).toBe('ImageFetchError')
      expect(err.code).toBe('TEST_CODE')
      expect(err.message).toBe('test')
      expect(err instanceof Error).toBe(true)
    })
  })
})
