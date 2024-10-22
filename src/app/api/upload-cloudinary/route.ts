import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      console.error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    })

    return NextResponse.json({ url: uploadResult.secure_url })
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return NextResponse.json({ error: 'Failed to upload image', details: (error as Error).message }, { status: 500 })
  }
}