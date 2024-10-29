import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('imageUrl')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': 'attachment; filename=spooklens-image.jpg',
        'Content-Type': 'image/jpeg',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
  }
}