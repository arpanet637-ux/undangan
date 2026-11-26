import type { Metadata } from 'next'
import { InvitationClient } from '@/components/invitation/invitation-client'
import { generateMetadata as generateInvitationMetadata } from '../../page'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; code: string }>
}): Promise<Metadata> {
  const { slug, code } = await params
  try {
    return await generateInvitationMetadata({
      params: Promise.resolve({ slug }),
      searchParams: Promise.resolve({ to: code }),
    })
  } catch (error) {
    console.error('[v0] Guest metadata fallback:', error)
    const fallbackImage = `https://v0-cetakfotodibali.vercel.app/api/og-image/${encodeURIComponent(slug)}/og.jpg`
    return {
      metadataBase: new URL('https://v0-cetakfotodibali.vercel.app'),
      title: 'Undangan Pernikahan',
      description: 'Buka undangan pernikahan online.',
      openGraph: {
        title: 'Undangan Pernikahan',
        description: 'Buka undangan pernikahan online.',
        url: `https://v0-cetakfotodibali.vercel.app/w/${encodeURIComponent(slug)}/to/${encodeURIComponent(code)}`,
        siteName: 'Undangan Pernikahan',
        type: 'website',
        images: [{
          url: fallbackImage,
          secureUrl: fallbackImage,
          width: 1200,
          height: 630,
          alt: 'Thumbnail Undangan',
          type: 'image/jpeg',
        }],
        locale: 'id_ID',
      },
      twitter: {
        card: 'summary_large_image',
        images: [fallbackImage],
      },
    }
  }
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string; code: string }>
}) {
  const { slug, code } = await params
  return <InvitationClient slug={slug} guestCode={code} />
}
