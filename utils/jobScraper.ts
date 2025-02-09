import puppeteer from 'puppeteer';

interface JobData {
  title?: string;
  company?: string;
  description: string;
  location?: string;
  error?: string;
}

export async function scrapeJobDescription(url: string): Promise<JobData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for job description content
    await page.waitForSelector('body');

    // Extract job details
    const jobData = await page.evaluate(() => {
      // Get all text content from the page
      const content = document.body.innerText;
      
      // Try to find common job posting elements
      const title = document.querySelector('h1')?.innerText || '';
      const company = document.querySelector('[data-test="company-name"]')?.textContent || '';
      const location = document.querySelector('[data-test="location"]')?.textContent || '';
      
      return {
        title,
        company,
        description: content,
        location
      };
    });

    return jobData;
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      description: '',
      error: 'Failed to scrape job description'
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 