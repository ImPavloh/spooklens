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
    // traducir en un futuro
    prompts: [
      "Spooky title, five words max",
      "Describe briefly, ten words max"
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
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.data?.analysis?.responses;
    const tokensUsed = result.limits?.usage?.count || 0;

    // respuestas concisas y tokens mínimos
    return {
      title: analysis[0]?.value?.slice(0, 50) || 'Untitled Image',
      description: analysis[1]?.value?.slice(0, 100) || 'No description available.',
      tokensUsed
    };
  } catch {
    // console.error('Error analyzing image:', error);
    throw new Error('Analysis failed.');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    const aiResponse = await analyzeImageWithAIVision(imageUrl);
    return NextResponse.json<AIResponse>(aiResponse);
  } catch {
    // console.error('API error:', error);
    return NextResponse.json({ error: 'Analysis error' }, { status: 500 });
  }
}
