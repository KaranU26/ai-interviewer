# AI Interview Preparation Assistant

An intelligent interview preparation tool that generates personalized interview questions and feedback based on your resume and job descriptions. Built with Next.js, OpenAI, and modern web technologies.

## Features

### 1. Smart Interview Generation
- Upload your resume (PDF format)
- Provide job posting URL
- Select interview type (Technical, Behavioral, General)
- AI-powered analysis of both resume and job description
- Generates tailored interview questions and feedback

### 2. Interactive Chat Interface
- Real-time AI responses
- Markdown formatting for clear structure
- Smooth animations and transitions
- Mobile-responsive design
- Persistent chat history
- Professional formatting with sections:
  - Introduction
  - Job Description Analysis
  - Resume Review
  - Interview Process
  - Tailored Questions
  - Initial Assessment

### 3. Technical Features
- PDF text extraction
- Web scraping for job descriptions
- OpenAI GPT integration
- Real-time chat capabilities
- Accessibility features
- Dark/Light mode support

## Tech Stack

- **Frontend:**
  - Next.js 13+ (App Router)
  - React
  - TypeScript
  - TailwindCSS
  - Shadcn/ui Components
  - Framer Motion
  - React Markdown

- **Backend:**
  - Next.js API Routes
  - OpenAI API
  - PDF.js for PDF processing
  - Puppeteer for web scraping

- **Development Tools:**
  - ESLint
  - Prettier
  - TypeScript
  - npm

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env.local
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/
│   │   └── prepare-interview/
│   ├── chat/
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   └── pdfUtils.ts
├── utils/
│   └── jobScraper.ts
└── public/
```

## Key Components

### Home Page (`app/page.tsx`)
- File upload interface
- Job URL input
- Interview type selection
- Initial interview preparation

### Chat Interface (`app/chat/page.tsx`)
- Real-time chat with AI
- Markdown rendering
- Animated messages
- Persistent chat history

### API Routes
- `/api/prepare-interview`: Initial interview setup
- `/api/chat`: Ongoing conversation handling

### Utilities
- `pdfUtils.ts`: PDF text extraction
- `jobScraper.ts`: Job description scraping

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT API
- Shadcn for UI components
- PDF.js for PDF processing
- Next.js team for the amazing framework