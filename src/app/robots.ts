import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://hivefy.web.app/sitemap.xml', // Replace with actual domain if known, common for firebase
  }
}
