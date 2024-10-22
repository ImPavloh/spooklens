// https://cloudinary.com/documentation/effects_and_artistic_enhancements#generative_background_replace
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { imageUrl, prompt, seed } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl parameter' }, { status: 400 });
    }

    let transformation = 'e_gen_background_replace';
    if (prompt) transformation += `:prompt_${encodeURIComponent(prompt)}`;
    if (seed !== undefined) transformation += `:seed_${seed}`;

    const transformedImageUrl = cloudinary.url(imageUrl, {
      transformation: [{ raw_transformation: transformation }],
    });

    return NextResponse.json({ transformedImageUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating background:', error);
    return NextResponse.json({ error: 'Error generating background' }, { status: 500 });
  }
}