import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { imageUrl } = await request.json();
  
  if (!imageUrl) {
    return NextResponse.json(
      { error: 'No image URL provided' },
      { status: 400 }
    );
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a fashion expert who rates outfits (OOTD - Outfit of the Day) on a scale of 1-10. Provide detailed feedback on style, color coordination, fit, and overall aesthetic. Also offer constructive suggestions for improvement."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Rate this outfit on a scale of 1-10 and provide detailed feedback." },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || "";
    
    // Parse the response to extract score, feedback and suggestions
    const scoreMatch = content.match(/(\d+(\.\d+)?)\s*\/\s*10/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 5;
    
    // Simple parsing - can be improved
    const parts = content.split(/suggestions:/i);
    const feedback = parts[0].replace(/score:?\s*\d+(\.\d+)?\s*\/\s*10/i, '').trim();
    const suggestions = parts.length > 1 ? parts[1].trim() : "";

    return NextResponse.json({
      score,
      feedback,
      suggestions,
      rawResponse: content
    });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json(
      { error: 'Error processing image' },
      { status: 500 }
    );
  }
} 