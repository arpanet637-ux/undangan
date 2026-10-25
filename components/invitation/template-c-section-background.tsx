'use client'

import type { ReactNode } from 'react'
import { TemplateCPhotoBackground } from './template-c-photo-background'

interface Props {
  children: ReactNode
  photos: string[]
}

export function TemplateCSectionBackground({ children, photos }: Props) {
  return (
    <section className="relative isolate overflow-hidden">
      <TemplateCPhotoBackground photos={photos} cycleInterval={4000} transitionDuration={1400} />
      <div className="relative z-10">{children}</div>
    </section>
  )
}
