import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weddings, couple, events, gallery, gifts, settings } from '@/db/schema'

export async function POST() {
  try {
    // Create a test wedding with dummy user ID
    const [wedding] = await db.insert(weddings).values({
      slug: 'ari-pradana-3b6h',
      adminCode: 'Q1IB51M7',
      groomName: 'Ari Pradana',
      brideName: 'Dewi Pratiwi',
      title: 'Ari Pradana & Dewi Pratiwi',
      weddingDate: '2024-12-15',
      userId: 'demo-user-id',
    }).returning()

    // Create couple entries
    await db.insert(couple).values([
      {
        weddingId: wedding.id,
        role: 'groom',
        fullName: 'Ari Pradana',
        nickname: 'Ari',
        fatherName: 'Bapak Pradana',
        motherName: 'Ibu Siti',
        childOrder: '1',
        address: 'Jl. Merdeka No. 123, Jakarta',
      },
      {
        weddingId: wedding.id,
        role: 'bride',
        fullName: 'Dewi Pratiwi',
        nickname: 'Dewi',
        fatherName: 'Bapak Pratiwi',
        motherName: 'Ibu Nurhaliza',
        childOrder: '1',
        address: 'Jl. Sudirman No. 456, Jakarta',
      },
    ])

    // Create events
    await db.insert(events).values([
      {
        weddingId: wedding.id,
        eventName: 'Resepsi Pernikahan',
        eventDate: '2024-12-15',
        eventTime: '18:00',
        venueName: 'Ballroom Hotel Mewah',
        venueAddress: 'Jl. Sudirman, Jakarta Pusat',
        mapsUrl: 'https://maps.google.com',
      },
    ])

    // Create settings (key-value pairs)
    await db.insert(settings).values([
      {
        weddingId: wedding.id,
        settingKey: 'opening_quote',
        settingValue: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.',
      },
      {
        weddingId: wedding.id,
        settingKey: 'opening_quote_source',
        settingValue: 'QS. Ar-Rum: 21',
      },
      {
        weddingId: wedding.id,
        settingKey: 'closing_text',
        settingValue: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.',
      },
    ])

    // Create gift info
    await db.insert(gifts).values({
      weddingId: wedding.id,
      bankName: 'Bank Indonesia',
      accountName: 'Ari Pradana',
      accountNumber: '1234567890',
    })

    return NextResponse.json({
      success: true,
      wedding: {
        id: wedding.id,
        slug: wedding.slug,
        adminCode: wedding.adminCode,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed', details: error }, { status: 500 })
  }
}
