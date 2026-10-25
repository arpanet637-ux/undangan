import { db } from '@/lib/db'
import { weddings, settings } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const template = searchParams.get('template') || 'template-a'

    console.log('[v0] Fetching projects for template:', template)

    // Query semua weddings
    const allWeddings = await db
      .select()
      .from(weddings)
      .orderBy(desc(weddings.createdAt))

    console.log('[v0] Found total weddings:', allWeddings.length)

    // Untuk setiap wedding, check template dari settings table
    const projectsWithTemplate = await Promise.all(
      allWeddings.map(async (w) => {
        const templateSetting = await db
          .select()
          .from(settings)
          .where(and(
            eq(settings.weddingId, w.id),
            eq(settings.settingKey, 'template')
          ))
          .limit(1)
        
        const templateValue = templateSetting[0]?.settingValue || 'template-a'
        return { wedding: w, template: templateValue }
      })
    )

    // Filter by selected template
    const filtered = projectsWithTemplate
      .filter(item => item.template === template)
      .map(item => item.wedding)

    console.log('[v0] Filtered projects for', template + ':', filtered.length)

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('[v0] Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      groomName,
      brideName,
      weddingDate,
      slug,
      adminCode,
      templateId,
      userId,
    } = body

    // Validasi input
    if (!title || !slug || !adminCode || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Slugs must be unique. Generate a safe suffix when the same title was used before.
    const baseSlug = String(slug).trim().toLowerCase()
    let uniqueSlug = baseSlug
    for (let attempt = 2; attempt <= 100; attempt++) {
      const existing = await db
        .select({ id: weddings.id })
        .from(weddings)
        .where(eq(weddings.slug, uniqueSlug))
        .limit(1)
      if (existing.length === 0) break
      uniqueSlug = `${baseSlug}-${attempt}`
    }

    // Insert new project
    const newProject = await db
      .insert(weddings)
      .values({
        title,
        groomName: groomName || '',
        brideName: brideName || '',
        weddingDate: weddingDate || undefined,
        slug: uniqueSlug,
        adminCode,
        userId,
        isActive: 1,
      })
      .returning()

    const projectId = newProject[0].id

    // Insert template setting
    await db
      .insert(settings)
      .values({
        weddingId: projectId,
        settingKey: 'template',
        settingValue: templateId || 'template-a',
      })

    return NextResponse.json(newProject[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
