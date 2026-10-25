import type { Participant } from './participants-section'

type CouplePerson = {
  id: number
  fullName: string
  photoUrl: string | null
  fatherName: string | null
  motherName: string | null
}

type ParticipantSetting = Partial<Participant> & {
  parentName?: string
  fatherName?: string
  motherName?: string
  photo?: string | null
  avatar?: string | null
}

export function getMetatahParticipants(
  settings: Record<string, string>,
  couple: CouplePerson[],
): Participant[] {
  try {
    const raw = settings.participants?.trim()
    if (raw) {
      const parsed = JSON.parse(raw) as ParticipantSetting[]
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item?.fullName?.trim())
          .map((item, index) => ({
            id: item.id ?? `participant-${index}`,
            fullName: item.fullName!.trim(),
            parentName:
              item.parentName?.trim() ||
              [item.fatherName, item.motherName].filter(Boolean).join(' & ') ||
              'Nama orang tua belum diisi',
            photoUrl: item.photoUrl || item.photo || item.avatar || null,
          }))
      }
    }
  } catch {
    // Invalid draft JSON falls back to the existing couple data.
  }

  return couple
    .filter((person) => person.fullName?.trim())
    .map((person) => ({
      id: person.id,
      fullName: person.fullName.trim(),
      parentName:
        [person.fatherName, person.motherName].filter(Boolean).join(' & ') ||
        'Nama orang tua belum diisi',
      photoUrl: person.photoUrl,
    }))
}
