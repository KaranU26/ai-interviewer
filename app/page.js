'use client';

import { useState } from 'react';
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { useRouter } from 'next/navigation';
import { extractTextFromPDF } from "../lib/pdfUtils";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobUrl: '',
    interviewType: '',
    resumeText: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!formData.jobUrl || !formData.interviewType) {
      setError('Please fill in all fields before uploading your resume');
      e.target.value = '';
      return;
    }

    if (file.type === 'application/pdf') {
      setIsLoading(true);
      setError('');
      
      try {
        // Extract text from PDF
        const text = await extractTextFromPDF(file);
        
        // Prepare the data for OpenAI
        const response = await fetch('/api/prepare-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobUrl: formData.jobUrl,
            interviewType: formData.interviewType,
            resumeText: text
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to prepare interview');
        }

        if (data.message) {
          localStorage.setItem('initialMessage', JSON.stringify(data.message));
          router.push('/chat');
        } else {
          throw new Error('No message received from API');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Failed to process resume and prepare interview');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please upload a PDF file');
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <main className="w-full max-w-2xl">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-center">
          AI Interview Preparation
        </h1>
        
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job Description URL</Label>
            <Input
              id="jobUrl"
              type="url"
              placeholder="Paste the job posting URL here..."
              onChange={(e) => {
                setFormData({...formData, jobUrl: e.target.value});
                setError('');
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewType">Interview Type</Label>
            <Select 
              onValueChange={(value) => {
                setFormData({...formData, interviewType: value});
                setError('');
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Interview</SelectItem>
                <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                <SelectItem value="general">General Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Upload Resume (PDF)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              required
            />
            {isLoading && (
              <p className="text-sm text-muted-foreground">
                Processing resume and preparing interview...
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
