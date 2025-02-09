import { NextApiRequest, NextApiResponse } from 'next';
import { getJobAnalysis } from '../../utils/jobScraper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const analysis = await getJobAnalysis(url);
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze job posting' });
  }
} 