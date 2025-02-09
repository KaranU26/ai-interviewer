'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string; // Add this for animation keys
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get the initial message from localStorage
    const initialMessage = localStorage.getItem('initialMessage');
    if (initialMessage) {
      try {
        const message = JSON.parse(initialMessage);
        setMessages([{ 
          role: 'assistant', 
          content: message,
          id: Date.now().toString() 
        }]);
        localStorage.removeItem('initialMessage'); // Clean up
      } catch (error) {
        console.error('Error parsing initial message:', error);
        setMessages([{ 
          role: 'assistant', 
          content: 'Sorry, there was an error starting the interview. Please try again.',
          id: Date.now().toString()
        }]);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = { 
      role: 'user', 
      content: input,
      id: Date.now().toString()
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          context: messages // Send previous messages for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        id: (Date.now() + 1).toString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        id: (Date.now() + 1).toString()
      }]);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden bg-background">
        <div className="h-full overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ 
                    opacity: 0, 
                    y: 20,
                    x: message.role === 'user' ? 20 : -20 
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    x: 0
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary/10 ml-auto max-w-[80%]' 
                      : 'bg-muted max-w-[80%]'
                  }`}
                >
                  <ReactMarkdown
                    className="prose dark:prose-invert max-w-none"
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="border-t bg-background">
        <form onSubmit={handleSubmit} className="p-4 max-w-3xl mx-auto">
          <div className="flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 