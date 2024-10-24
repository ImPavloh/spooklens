/*
https://cloudinary.com/documentation/cloudinary_ai_vision_addon
(Cloudinary AI Vision está en fase beta y es un addon, hay que instalarlo antes)

aún tiene bastante fallos, a veces genera y a veces no \-o-/
*/

import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { getCloudinarySignature } from '@/lib/cloudinary';

interface AIResponse {
  title: string;
  description: string;
  tokensUsed: number;
}

async function analyzeImageWithAIVision(imageUrl: string): Promise<AIResponse> {
  const endpoint = `https://api.cloudinary.com/v2/analysis/${cloudinary.config().cloud_name}/analyze/ai_vision_general`;

  const payload = {
    source: { uri: imageUrl },
    prompts: [
      "Create a spooky title for this eerie image in five words or less",
      "Briefly describe this image in ten words or less"
    ]
  };

  const { timestamp, signature } = await getCloudinarySignature();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${cloudinary.config().api_key}:${cloudinary.config().api_secret}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'X-Cloudinary-Timestamp': timestamp.toString(),
        'X-Cloudinary-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Vision API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const analysis = result.data?.analysis?.responses;
    const tokensUsed = result.limits?.usage?.count || 0; // (obtener los tokens utilizados)

    if (!analysis || !Array.isArray(analysis) || analysis.length < 2) {
      throw new Error('Unexpected AI Vision response format');
    }

    const title = analysis[0]?.value?.trim() || 'Untitled Spooky Image';
    const description = analysis[1]?.value?.trim() || 'Mysterious scene.';

    // respuestas concisas y tokens mínimos
    return {
      title: title.slice(0, 50),
      description: description.slice(0, 100),
      tokensUsed
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Image analysis failed. Please try again later.');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing image URL' }, { status: 400 });
    }

    const aiResponse = await analyzeImageWithAIVision(imageUrl);
    return NextResponse.json<AIResponse>(aiResponse);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to generate image analysis' }, { status: 500 });
  }
}