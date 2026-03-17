import type { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: {
    default: 'StudioDesk',
    template: '%s | StudioDesk',
  },
  description: 'Pro studio management for Indian photographers — GST invoicing, AI photo delivery, WhatsApp automations.',
  keywords: ['photography studio management', 'GST invoice photographer', 'wedding photography software India', 'photo delivery India'],
  authors: [{ name: 'StudioDesk' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://app.studiodesk.in'),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'StudioDesk',
  },
}

/**
 * For public pages (inquiry form, gallery)
 */
export function getPublicPageMetadata(params: {
  studioName: string
  title?: string
  description?: string
  imageUrl?: string
  noIndex?: boolean
}): Metadata {
  const pageTitle = params.title ?? `Book ${params.studioName}`;
  const pageDesc = params.description ?? `Book professional photography services with ${params.studioName}.`;
  
  return {
    title: pageTitle,
    description: pageDesc,
    robots: { 
      index: !params.noIndex, 
      follow: !params.noIndex 
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      images: params.imageUrl
        ? [{ url: params.imageUrl }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: params.imageUrl ? [params.imageUrl] : undefined,
    }
  }
}
