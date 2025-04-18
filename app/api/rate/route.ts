import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 添加环境变量检查
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set');
}

// 清理API密钥，移除可能导致HTTP头无效的字符
const cleanApiKey = process.env.OPENAI_API_KEY?.trim() || '';

// 配置OpenAI或Azure OpenAI
const openai = process.env.AZURE_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY.trim(),
      baseURL: process.env.AZURE_OPENAI_ENDPOINT,
      defaultQuery: { 'api-version': '2023-12-01-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY.trim() }
    })
  : new OpenAI({
      apiKey: cleanApiKey,
      dangerouslyAllowBrowser: false,
    });

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    
    console.log('Processing image URL:', imageUrl);
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // 验证URL格式
    try {
      new URL(imageUrl);
    } catch (e) {
      console.error('Invalid URL format:', imageUrl);
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    // 检查URL是否可访问（可选，因为会增加延迟）
    try {
      const urlCheckResponse = await fetch(imageUrl, { method: 'HEAD' });
      if (!urlCheckResponse.ok) {
        console.error('Image URL not accessible:', imageUrl, 'Status:', urlCheckResponse.status);
        return NextResponse.json(
          { error: `Image URL not accessible, status: ${urlCheckResponse.status}` },
          { status: 400 }
        );
      }
    } catch (urlError) {
      console.error('Error checking image URL:', urlError);
      // 继续处理，因为某些URL可能拒绝HEAD请求但仍然可用
    }

    try {
      console.log('Calling OpenAI API...');
      let response;
      
      // 获取OpenAI模型名称或Azure部署名称
      const visionModel = process.env.AZURE_OPENAI_API_KEY 
        ? process.env.AZURE_OPENAI_VISION_DEPLOYMENT || 'gpt-4'
        : "gpt-4-vision-preview";
        
      const fallbackModel = process.env.AZURE_OPENAI_API_KEY
        ? process.env.AZURE_OPENAI_FALLBACK_DEPLOYMENT || 'gpt-4'
        : "gpt-4o";
      
      try {
        console.log(`Using model: ${visionModel}`);
        response = await openai.chat.completions.create({
          model: visionModel,
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
      } catch (visionError: any) {
        console.error(`Error with ${visionModel}:`, visionError.message);
        console.log(`Trying alternative model: ${fallbackModel}...`);
        
        // 尝试使用另一个模型
        response = await openai.chat.completions.create({
          model: fallbackModel,
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
      }

      console.log('OpenAI API response received');
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
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      console.error('Error details:', error.message);
      if (error.response) {
        console.error('OpenAI API error response:', error.response.data);
      }
      return NextResponse.json(
        { error: 'Error processing image', details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: 'Invalid request format', details: error.message },
      { status: 400 }
    );
  }
} 