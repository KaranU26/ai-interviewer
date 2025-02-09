import puppeteer from 'puppeteer';
import { OpenAI } from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScrapedJobData {
  title: string;
  company: string;
  description: string;
  location: string;
  error?: string;
}

const scrapeJobDescription = async (url: string): Promise<ScrapedJobData> => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  try {
    const page = await browser.newPage();
    
    // Bypass basic bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Different selectors for different platforms
    const jobData = await page.evaluate(() => {
      const getTextContent = (selector: string) => {
        const element = document.querySelector(selector);
        return element ? element.textContent?.trim() : '';
      };

      // LinkedIn selectors
      if (window.location.hostname.includes('linkedin')) {
        return {
          title: getTextContent('.job-details-jobs-unified-top-card__job-title'),
          company: getTextContent('.job-details-jobs-unified-top-card__company-name'),
          description: getTextContent('.job-details-jobs-unified-top-card__description-container'),
          location: getTextContent('.job-details-jobs-unified-top-card__bullet'),
        };
      }

      // Indeed selectors
      if (window.location.hostname.includes('indeed')) {
        return {
          title: getTextContent('.jobsearch-JobInfoHeader-title'),
          company: getTextContent('.jobsearch-InlineCompanyRating-companyHeader'),
          description: getTextContent('#jobDescriptionText'),
          location: getTextContent('.jobsearch-JobInfoHeader-subtitle'),
        };
      }

      // Default fallback
      return {
        title: getTextContent('h1'),
        company: '',
        description: getTextContent('body'),
        location: '',
      };
    });

    return jobData;

  } catch (error) {
    console.error('Scraping error:', error);
    return {
      title: '',
      company: '',
      description: '',
      location: '',
      error: 'Failed to scrape job description'
    };
  } finally {
    await browser.close();
  }
};

const analyzeWithGPT = async (jobData: ScrapedJobData) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a job analysis expert. Analyze the following job description and extract key information."
        },
        {
          role: "user",
          content: `
            Job Title: ${jobData.title}
            Company: ${jobData.company}
            Location: ${jobData.location}
            
            Description:
            ${jobData.description}
            
            Please analyze this job posting and provide:
            1. Required skills
            2. Years of experience needed
            3. Key responsibilities
            4. Technology stack mentioned
            5. Salary range (if mentioned)
            6. Required education
            7. Benefits mentioned
          `
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Failed to analyze job description';
  }
};

// Main function to handle both scraping and analysis
const getJobAnalysis = async (url: string) => {
  try {
    const jobData = await scrapeJobDescription(url);
    
    if (jobData.error) {
      return { error: jobData.error };
    }

    const analysis = await analyzeWithGPT(jobData);
    return {
      jobData,
      analysis
    };
  } catch (error) {
    return { error: 'Failed to process job description' };
  }
};

export { getJobAnalysis }; 