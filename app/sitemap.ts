import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://proofday.app'
  return [
    {
      url: baseUrl,
      lastModified: new Date('2026-03-28'),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
