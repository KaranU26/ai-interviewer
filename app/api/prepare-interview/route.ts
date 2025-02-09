import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { scrapeJobDescription } from '../../../utils/jobScraper';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    console.log('API Key available:', !!process.env.OPENAI_API_KEY);
    const { jobUrl, interviewType, resumeText } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Scrape job description
    console.log('Scraping job description from:', jobUrl);
    const jobData = await scrapeJobDescription(jobUrl);
    if (!jobData || jobData.error) {
      throw new Error('Failed to fetch job description');
    }
    console.log('Job description scraped successfully');

    try {
      // Create the system prompt with better formatting instructions
      const systemPrompt = `You are an experienced interviewer conducting a ${interviewType} interview. 
      You will prepare questions and feedback based on the candidate's resume and job description.
      
      Format your response using markdown with the following structure:

      # Introduction
      Introduce yourself briefly and professionally.

      # Job Description
      Write details of the job description

      # Resume
      Write details of the candidate's resume

      # Interview Process
      Explain how the interview will be conducted in 2-3 sentences.

      # Questions
      Prepare 5-7 relevant questions based on the resume and job description. Format them as a numbered list:
      1. [First Question]
      2. [Second Question]
      ...

      # Initial Assessment
      Provide a brief assessment of how the candidate's resume aligns with the job requirements. Use bullet points:
      - [First point]
      - [Second point]
      ...`;

      console.log('Sending request to OpenAI...');
      // Get completion from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Job Description:\n${jobData.description}\n\nResume:\n${resumeText}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,  // Increased for more detailed response
      });

      // Get the response message
      const message = completion.choices[0].message.content;
      if (!message) {
        throw new Error('No response received from OpenAI');
      }
      console.log('OpenAI response received successfully');

      return NextResponse.json({ message });
    } catch (openaiError: any) {
      // Handle OpenAI specific errors
      console.error('OpenAI Error:', openaiError);
      if (openaiError?.status === 429) {
        return NextResponse.json(
          { 
            error: 'OpenAI API quota exceeded. Please try again later or contact support to upgrade your plan.',
            details: openaiError.message
          },
          { status: 429 }
        );
      }
      throw openaiError;
    }
  } catch (error) {
    console.error('Error preparing interview:', error);
    let errorMessage = 'Failed to prepare interview';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 