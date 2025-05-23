import { NextResponse } from 'next/server';
import { scrapeJobDescription } from '../../../utils/jobScraper';
import openai from '../../../../lib/openaiClient';
import { createErrorResponse } from '../../../../lib/apiUtils';

export async function POST(req: Request) {
  try {
    console.log('API Key available:', !!process.env.OPENAI_API_KEY); // This console.log can also be removed, but the subtask description doesn't explicitly ask for it. I'll leave it for now.
    const { jobUrl, interviewType, resumeText } = await req.json();

    // Scrape job description
    console.log('Scraping job description from:', jobUrl);
    const jobData = await scrapeJobDescription(jobUrl);
    if (!jobData || jobData.error) {
      console.error('Failed to fetch job description:', jobData?.error);
      return createErrorResponse('Failed to fetch job description', 500, jobData?.error || 'Scraping function returned an error.');
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
        console.error('OpenAI Error: No response message content in prepare-interview.');
        return createErrorResponse('No response content received from OpenAI', 500, 'The message content was empty after preparing interview questions.');
      }
      console.log('OpenAI response received successfully');

      return NextResponse.json({ message });
    } catch (openaiError: any) {
      // Handle OpenAI specific errors
      console.error('OpenAI Error:', openaiError);
      if (openaiError?.status === 429) {
        return createErrorResponse(
          'OpenAI API quota exceeded. Please try again later or contact support to upgrade your plan.',
          429,
          openaiError.message
        );
      }
      // If it's not a 429, rethrow to be caught by the outer catch block
      throw openaiError; 
    }
  } catch (error) {
    console.error('Error preparing interview:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during interview preparation';
    return createErrorResponse('Failed to prepare interview', 500, message);
  }
} 