import { NextResponse } from 'next/server';
import openai from '../../../../lib/openaiClient';
import { createErrorResponse } from '../../../../lib/apiUtils';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

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
      console.error('OpenAI Error: No response message content.');
      return createErrorResponse('No response content received from OpenAI', 500, 'The message content was empty.');
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Chat API Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return createErrorResponse('Failed to get response from chat API', 500, message);
  }
} 