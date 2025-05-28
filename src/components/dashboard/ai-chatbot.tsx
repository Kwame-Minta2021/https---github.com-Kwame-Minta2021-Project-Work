"use client";

import { useState, useRef, useEffect } from 'react';
import { askChatbot, type AskChatbotInput } from '@/ai/flows/interactive-ai-chatbot';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, BotIcon, UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface AIChatbotProps {
  currentReadings: Omit<AskChatbotInput, 'question'>;
}

export default function AIChatbot({ currentReadings }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if(scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Initial greeting from the bot
    setMessages([
      { id: Date.now().toString(), text: "Hello! How can I help you with your air quality questions today?", sender: 'bot' }
    ]);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatbotInput: AskChatbotInput = {
        ...currentReadings,
        question: input,
      };
      const response = await askChatbot(chatbotInput);
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: response.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error. Please try again.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-12rem)]">
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-3 mb-4",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender === 'bot' && (
              <Avatar className="h-8 w-8 border border-primary">
                <AvatarFallback><BotIcon className="h-5 w-5 text-primary" /></AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-[70%] rounded-xl px-4 py-2.5 text-sm shadow-md",
                msg.sender === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <Avatar className="h-8 w-8 border">
                <AvatarFallback><UserIcon className="h-5 w-5 text-foreground" /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 mb-4 justify-start">
            <Avatar className="h-8 w-8 border border-primary">
              <AvatarFallback><BotIcon className="h-5 w-5 text-primary" /></AvatarFallback>
            </Avatar>
            <div className="max-w-[70%] rounded-xl px-4 py-2.5 text-sm shadow-md bg-muted text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-4 bg-background">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about air quality..."
          className="flex-grow"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
