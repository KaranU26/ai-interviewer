import { NextResponse } from 'next/server';
import openai from '../../../../lib/openaiClient';
import { createErrorResponse } from '../../../../lib/apiUtils';

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }],
    });

    return NextResponse.json({ success: true, message: completion.choices[0].message });
  } catch (error) {
    console.error('OpenAI Test Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during OpenAI test';
    return createErrorResponse('OpenAI API test failed', 500, message);
  }
} 