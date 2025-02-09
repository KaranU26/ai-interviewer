import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Create the system prompt
    const systemPrompt = `You are an experienced interviewer. Continue the interview based on the candidate's responses. 
    Provide thoughtful follow-up questions and feedback. Keep your responses professional and constructive.
    
    Format your response using markdown with clear sections when appropriate.`;

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Get the response message
    const responseMessage = completion.choices[0].message.content;
    if (!responseMessage) {
      throw new Error('No response received from OpenAI');
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Chat API Error:', error);
    let errorMessage = 'Failed to get response';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 