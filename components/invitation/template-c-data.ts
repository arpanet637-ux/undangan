'use client'

export interface MetatahParticipant {
  id: string | number
  fullName: string
  nickname: string
  parentName: string
  instagramUrl: string
  avatar: string | null
}

type RawParticipant = {
  id?: string | number
  fullName?: string
  parentName?: string
  parentNames?: string
  fatherName?: string
  motherName?: string
  photo?: string | null
  photoUrl?: string | null
  avatar?: string | null
  nickname?: string
  instagramUrl?: string
  instagram?: string
}

export function getTemplateCParticipants(settings: Record<string, string>): MetatahParticipant[] {
  try {
    const parsed = JSON.parse(settings.participants || '[]') as RawParticipant[]
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((item, index) => {
      const fullName = item?.fullName?.trim()
      if (!fullName) return []

      const parentName =
        item.parentName?.trim() ||
        item.parentNames?.trim() ||
        [item.fatherName, item.motherName].filter(Boolean).join(' & ') ||
        'Nama orang tua belum diisi'

      return [{
        id: item.id ?? `metatah-${index + 1}`,
        fullName,
        nickname: item.nickname?.trim() || fullName,
        parentName,
        instagramUrl: item.instagramUrl?.trim() || item.instagram?.trim() || '',
        avatar: item.avatar || item.photo || item.photoUrl || null,
      }]
    })
  } catch {
    return []
  }
}

export const createEmptyTemplateCParticipant = (index: number): MetatahParticipant => ({
  id: `metatah-${index + 1}`,
  fullName: '',
  nickname: '',
  parentName: '',
  instagramUrl: '',
  avatar: null,
})
