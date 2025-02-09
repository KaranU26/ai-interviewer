import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }],
    });

    return NextResponse.json({ success: true, message: completion.choices[0].message });
  } catch (error) {
    console.error('OpenAI Test Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 