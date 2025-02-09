import { TextItem } from 'pdfjs-dist/types/src/display/api';

// We'll load PDF.js dynamically to avoid SSR issues
let pdfjsLib: any;

// Initialize PDF.js
async function initPdfJs() {
  if (typeof window === 'undefined') return;
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/build/pdf');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
  }
  return pdfjsLib;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Initialize PDF.js if needed
    const pdf = await initPdfJs();
    if (!pdf) {
      throw new Error('PDF.js failed to initialize');
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdf.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      verbosity: 0
    });
    
    const pdfDoc = await loadingTask.promise;
    let fullText = '';
    
    // Iterate through each page
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
} 